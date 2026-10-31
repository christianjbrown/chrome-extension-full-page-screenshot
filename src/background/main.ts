// The service worker: builds the object graph and connects it to Chrome's events.
import type { OffscreenMessage } from "../shared/messages";
import { RuntimeMessenger } from "../shared/runtime-messenger";
import { CapturableTabs } from "./capturable-tabs";
import { SlicePlanner } from "./capture-plan";
import { ChromeErrorExplainer } from "./chrome-errors";
import { DownloadSaver } from "./download-saver";
import { FullPageShooter } from "./full-page-shooter";
import { OffscreenStitcher } from "./offscreen-stitcher";
import { PageClient } from "./page-client";
import { FinitePageValidator } from "./page-validator";
import { TimestampedNamer } from "./screenshot-namer";
import { ScreenshotController } from "./screenshot-controller";
import { SystemClock } from "./system-clock";
import { ToolbarIndicator } from "./toolbar-indicator";
import { ThrottledCapture, TimerSleeper } from "./visible-tab-capture";

const clock = new SystemClock();
const indicator = new ToolbarIndicator(chrome.action);
const stitcher = new OffscreenStitcher(
  chrome.offscreen,
  chrome.runtime,
  new RuntimeMessenger<OffscreenMessage>(chrome.runtime),
  "offscreen.html",
);
const controller = new ScreenshotController({
  targets: new CapturableTabs(chrome.extension),
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
