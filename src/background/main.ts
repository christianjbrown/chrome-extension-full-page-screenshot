// The service worker: builds the object graph and connects it to Chrome's events.
import { DARK_SCHEME_QUERY } from "../shared/colour-scheme";
import { CommandRouter } from "../shared/command-router";
import { OwnContextFilter } from "../shared/own-context-filter";
import { everyCommandOnce } from "../shared/every-command-once";
import type {
  BackgroundMessage,
  OffscreenMessage,
  Reply,
} from "../shared/messages";
import { TARGETS } from "../shared/targets";
import { ReplyUnwrapper } from "../shared/reply-unwrapper";
import { SettledResponder } from "../shared/settled-responder";
import { RuntimeMessenger } from "../shared/runtime-messenger";
import { SerialQueue } from "../shared/serial-queue";
import { CapturableTabs } from "./capturable-tabs";
import { BrowserPageRule, LocalFileRule, WebStoreRule } from "./capture-rules";
import { SlicePlanner } from "./capture-plan";
import { CAPTURE_SPACING_MS } from "./capture-quota";
import { ChromeErrorExplainer } from "./chrome-errors";
import {
  LeftTabRefusal,
  LocalFileRefusal,
  OwnPageRefusal,
  WebStoreRefusal,
} from "./chrome-refusals";
import { ClickScheme } from "./click-scheme";
import { BACKGROUND_CONFIG } from "./config";
import { DeviceSchemeCommand } from "./device-scheme-command";
import { DownloadCompletion } from "./download-completion";
import { DownloadSaver } from "./download-saver";
import { OFFSCREEN_DOCUMENT_PATH, PAGE_SCRIPT } from "./entries";
import { ClaimedFilenames } from "./claimed-filenames";
import { FilenameListening } from "./filename-listening";
import { FullPageShooter } from "./full-page-shooter";
import { OffscreenPage } from "./offscreen-page";
import { OffscreenStitcher } from "./offscreen-stitcher";
import { PageClient } from "./page-client";
import { QuietClick } from "./quiet-click";
import { FinitePageValidator } from "./finite-page-validator";
import { RenewingDocument } from "./renewing-document";
import { SCHEME_POLICY, UNKNOWN_SCHEME } from "./scheme-state";
import { SchemeStore } from "./scheme-store";
import { ScreenshotController } from "./screenshot-controller";
import { SystemClock } from "./system-clock";
import { tabPrefersDark } from "./tab-probe";
import { TabScheme } from "./tab-scheme";
import { ToolbarIcon } from "./toolbar-icon";
import { ToolbarIndicator } from "./toolbar-indicator";
import {
  CAPTURING_LOOK,
  FAILED_LOOK,
  IDLE_LOOK,
  SAVING_LOOK,
} from "./toolbar-looks";
import { FailedStage, ProgressStage, SteadyStage } from "./toolbar-stages";
import { ToolbarScheme } from "./toolbar-scheme";
import type { ScreenshotStages } from "./screenshot-indicator";
import { ThrottledCapture } from "./throttled-capture";
import { TimerSleeper } from "./timer-sleeper";
import { TimestampedNamer } from "./timestamped-namer";
import { KebabSlugger } from "./kebab-slugger";
import { LocalTimeStamper } from "./local-time-stamper";

// What the person who clicked is told when Chrome will not let a tab be
// captured. The rules that check first and the explainer that translates
// Chrome's own errors afterwards say the same things.
const OWN_PAGES_REFUSAL =
  "Chrome does not let extensions capture its own pages";
const WEB_STORE_REFUSAL =
  "Chrome does not let extensions capture the Web Store";
const LOCAL_FILES_REFUSAL =
  "Turn on Allow access to file URLs for this extension to capture local files";
const LEFT_TAB_REFUSAL = "Stay on the tab until the screenshot is done";

const clock = new SystemClock(Date);
const replies = new ReplyUnwrapper();
// Chrome only asks this extension to name downloads while one of its own is
// waiting for a name: each claim holds the listener and naming it releases it.
const filenames: ClaimedFilenames = new ClaimedFilenames(
  new FilenameListening(
    chrome.downloads.onDeterminingFilename,
    (item: chrome.downloads.DownloadItem, suggest) => {
      filenames.determine(item, suggest);
    },
  ),
);
const indicator = new ToolbarIndicator(chrome.action);
const stages = {
  idle: new SteadyStage(IDLE_LOOK),
  progress: new ProgressStage(CAPTURING_LOOK),
  saving: new SteadyStage(SAVING_LOOK),
  failed: new FailedStage(FAILED_LOOK),
} satisfies ScreenshotStages;
// The device's scheme comes from the offscreen document and Chrome's own from a
// clicked tab, so the icon is worked out from both.
const toolbarScheme = new ToolbarScheme(
  new SchemeStore(chrome.storage.local, UNKNOWN_SCHEME),
  new ToolbarIcon(chrome.action),
  new SerialQueue(),
  SCHEME_POLICY,
);
const clickScheme = new QuietClick(
  new ClickScheme(
    new TabScheme(chrome.scripting, tabPrefersDark, DARK_SCHEME_QUERY),
    toolbarScheme,
  ),
);
// One offscreen document does two jobs: it stitches, and it watches the colour
// scheme. It is open for as long as Chrome runs so that a change of scheme
// reaches a sleeping service worker.
const offscreenPage = new OffscreenPage(
  chrome.offscreen,
  chrome.runtime,
  new SerialQueue(),
  OFFSCREEN_DOCUMENT_PATH,
);
// A capture renews the document so that its blob URLs die, and the watcher
// carries on in the new one.
const stitcher = new OffscreenStitcher(
  new RenewingDocument(offscreenPage),
  new RuntimeMessenger<OffscreenMessage>(chrome.runtime),
  replies,
);
const router = new CommandRouter<BackgroundMessage>(
  everyCommandOnce<BackgroundMessage>()(new DeviceSchemeCommand(toolbarScheme)),
  new OwnContextFilter(chrome.runtime.id, TARGETS.background),
  new SettledResponder(),
);
const controller = new ScreenshotController({
  targets: new CapturableTabs([
    new BrowserPageRule(OWN_PAGES_REFUSAL),
    new WebStoreRule(WEB_STORE_REFUSAL),
    new LocalFileRule(chrome.extension, LOCAL_FILES_REFUSAL),
  ]),
  shooter: new FullPageShooter({
    page: new PageClient({
      scripting: chrome.scripting,
      tabs: chrome.tabs,
      file: PAGE_SCRIPT,
      validator: new FinitePageValidator(),
      replies,
    }),
    planner: new SlicePlanner({
      maxPageHeight: BACKGROUND_CONFIG.maxPageHeight,
      minFrameHeight: BACKGROUND_CONFIG.minFrameHeight,
      maxSlices: BACKGROUND_CONFIG.maxSlices,
    }),
    capture: new ThrottledCapture(
      chrome.tabs,
      clock,
      new TimerSleeper((callback, ms) => setTimeout(callback, ms)),
      CAPTURE_SPACING_MS,
    ),
    stitcher,
    indicator,
    stages,
  }),
  stitcher,
  namer: new TimestampedNamer({
    clock,
    slugger: new KebabSlugger(BACKGROUND_CONFIG.maxTitleLength),
    stamper: new LocalTimeStamper(),
  }),
  saver: new DownloadSaver(
    chrome.downloads,
    filenames,
    new DownloadCompletion(chrome.downloads.onChanged),
  ),
  indicator,
  stages,
  errors: new ChromeErrorExplainer([
    new OwnPageRefusal(OWN_PAGES_REFUSAL),
    new WebStoreRefusal(WEB_STORE_REFUSAL),
    new LocalFileRefusal(LOCAL_FILES_REFUSAL),
    new LeftTabRefusal(LEFT_TAB_REFUSAL),
  ]),
});

chrome.action.onClicked.addListener((tab) => {
  void controller.take(tab);
  void clickScheme.clicked(tab);
});
chrome.runtime.onMessage.addListener(
  (message: unknown, sender, sendResponse: (reply: Reply<unknown>) => void) =>
    router.route(message, sender, sendResponse),
);
// Chrome starts with no offscreen document, and nothing else wakes the service
// worker then.
chrome.runtime.onStartup.addListener(() => {
  void offscreenPage.open();
});
void offscreenPage.open();
