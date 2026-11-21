// The service worker: builds the object graph and connects it to Chrome's events.
import { CommandRouter } from "../shared/command-router";
import { backgroundGuards } from "../shared/message-guards";
import {
  TARGETS,
  type BackgroundMessage,
  type OffscreenMessage,
  type Reply,
} from "../shared/messages";
import { RuntimeMessenger } from "../shared/runtime-messenger";
import { CapturableTabs } from "./capturable-tabs";
import { BrowserPageRule, LocalFileRule, WebStoreRule } from "./capture-rules";
import { SlicePlanner } from "./capture-plan";
import { ChromeErrorExplainer } from "./chrome-errors";
import { ClickScheme } from "./click-scheme";
import { DownloadSaver } from "./download-saver";
import { OFFSCREEN_DOCUMENT_PATH, PAGE_SCRIPT } from "./entries";
import { ClaimedFilenames } from "./filename-claims";
import { FullPageShooter } from "./full-page-shooter";
import { OffscreenPage } from "./offscreen-page";
import { OffscreenStitcher } from "./offscreen-stitcher";
import { PageClient } from "./page-client";
import { FinitePageValidator } from "./page-validator";
import { ReopeningDocument } from "./reopening-document";
import { TimestampedNamer } from "./screenshot-namer";
import { SCHEME_POLICY, UNKNOWN_SCHEME } from "./scheme-state";
import { SchemeStore } from "./scheme-store";
import { ScreenshotController } from "./screenshot-controller";
import { SystemClock } from "./system-clock";
import { TabScheme } from "./tab-scheme";
import { ToolbarIcon } from "./toolbar-icon";
import { ToolbarIndicator } from "./toolbar-indicator";
import { ToolbarScheme } from "./toolbar-scheme";
import { ThrottledCapture, TimerSleeper } from "./visible-tab-capture";

const clock = new SystemClock();
const filenames = new ClaimedFilenames();
const indicator = new ToolbarIndicator(chrome.action);
// The device's scheme comes from the offscreen document and Chrome's own from a
// clicked tab, so the icon is worked out from both.
const toolbarScheme = new ToolbarScheme(
  new SchemeStore(chrome.storage.local, UNKNOWN_SCHEME),
  new ToolbarIcon(chrome.action),
  SCHEME_POLICY,
);
const clickScheme = new ClickScheme(
  new TabScheme(chrome.scripting),
  toolbarScheme,
);
// One offscreen document does two jobs: it stitches, and it watches the colour
// scheme. It is open for as long as Chrome runs so that a change of scheme
// reaches a sleeping service worker.
const offscreenPage = new OffscreenPage(
  chrome.offscreen,
  chrome.runtime,
  OFFSCREEN_DOCUMENT_PATH,
);
// A capture closes the document so that its blob URLs die, and the watcher has
// to carry on afterwards.
const stitcher = new OffscreenStitcher(
  new ReopeningDocument(offscreenPage),
  new RuntimeMessenger<OffscreenMessage>(chrome.runtime),
);
const router = new CommandRouter<BackgroundMessage>(
  TARGETS.background,
  { scheme: (message) => toolbarScheme.deviceIs(message.scheme) },
  backgroundGuards,
  chrome.runtime.id,
);
const controller = new ScreenshotController({
  targets: new CapturableTabs([
    new BrowserPageRule(),
    new WebStoreRule(),
    new LocalFileRule(chrome.extension),
  ]),
  shooter: new FullPageShooter({
    page: new PageClient(
      chrome.scripting,
      chrome.tabs,
      PAGE_SCRIPT,
      new FinitePageValidator(),
    ),
    planner: new SlicePlanner(),
    capture: new ThrottledCapture(
      chrome.tabs,
      clock,
      new TimerSleeper((callback, ms) => setTimeout(callback, ms)),
    ),
    stitcher,
    indicator,
  }),
  stitcher,
  namer: new TimestampedNamer(clock),
  saver: new DownloadSaver(chrome.downloads, filenames),
  indicator,
  errors: new ChromeErrorExplainer(),
});

chrome.action.onClicked.addListener((tab) => {
  void controller.take(tab);
  // Beside the capture, never part of it: a failed read must not stop a
  // screenshot, and the capture does not wait for it.
  void clickScheme.clicked(tab).catch(() => undefined);
});
// Registered at the top so that Chrome finds it when the service worker wakes.
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  filenames.determine(item, suggest);
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
