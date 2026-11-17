// The service worker: builds the object graph and connects it to Chrome's events.
import { CommandRouter } from "../shared/command-router";
import { backgroundGuards } from "../shared/message-guards";
import type {
  BackgroundMessage,
  OffscreenMessage,
  Reply,
} from "../shared/messages";
import { RuntimeMessenger } from "../shared/runtime-messenger";
import { CapturableTabs } from "./capturable-tabs";
import { BrowserPageRule, LocalFileRule, WebStoreRule } from "./capture-rules";
import { SlicePlanner } from "./capture-plan";
import { ChromeErrorExplainer } from "./chrome-errors";
import { DownloadSaver } from "./download-saver";
import { FullPageShooter } from "./full-page-shooter";
import { OffscreenPage } from "./offscreen-page";
import { OffscreenStitcher } from "./offscreen-stitcher";
import { PageClient } from "./page-client";
import { FinitePageValidator } from "./page-validator";
import { ReopeningDocument } from "./reopening-document";
import { TimestampedNamer } from "./screenshot-namer";
import { ScreenshotController } from "./screenshot-controller";
import { SystemClock } from "./system-clock";
import { ToolbarIcon } from "./toolbar-icon";
import { ToolbarIndicator } from "./toolbar-indicator";
import { ThrottledCapture, TimerSleeper } from "./visible-tab-capture";

const clock = new SystemClock();
const indicator = new ToolbarIndicator(chrome.action);
const icon = new ToolbarIcon(chrome.action);
// One offscreen document does two jobs: it stitches, and it watches the colour
// scheme. It is open for as long as Chrome runs so that a change of scheme
// reaches a sleeping service worker.
const offscreenPage = new OffscreenPage(
  chrome.offscreen,
  chrome.runtime,
  "offscreen.html",
);
// A capture closes the document so that its blob URLs die, and the watcher has
// to carry on afterwards.
const stitcher = new OffscreenStitcher(
  new ReopeningDocument(offscreenPage),
  new RuntimeMessenger<OffscreenMessage>(chrome.runtime),
);
const router = new CommandRouter<BackgroundMessage>(
  "background",
  { scheme: (message) => icon.show(message.scheme) },
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
      "page.js",
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
  saver: new DownloadSaver(chrome.downloads),
  indicator,
  errors: new ChromeErrorExplainer(),
});

chrome.action.onClicked.addListener((tab) => {
  void controller.take(tab);
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
