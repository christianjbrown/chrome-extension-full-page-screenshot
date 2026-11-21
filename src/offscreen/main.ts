// The offscreen document: builds the object graph and listens for the service
// worker. It does two jobs a service worker cannot. It stitches, because a
// service worker cannot make a blob URL and a full page PNG is far too big to
// download as a data URL. And it watches Chrome's colour scheme, because a
// service worker has no matchMedia.
import { DARK_SCHEME_QUERY } from "../shared/colour-scheme";
import { CommandRouter } from "../shared/command-router";
import { OwnContextFilter } from "../shared/message-filter";
import { offscreenGuards } from "../shared/message-guards";
import {
  TARGETS,
  type BackgroundMessage,
  type OffscreenMessage,
  type Reply,
} from "../shared/messages";
import { SettledResponder } from "../shared/replies";
import { RuntimeMessenger } from "../shared/runtime-messenger";
import { BlobUrls } from "./blob-urls";
import { MAX_PART_PIXELS, MAX_PART_SIDE } from "./canvas-limits";
import { OFFSCREEN_CONFIG } from "./config";
import { DataUrlDecoder } from "./image-decoder";
import { DeviceGeometry } from "./device-geometry";
import { CanvasLimitCutter } from "./part-layout";
import { CutPictureSizer } from "./picture";
import { SchemeReporter } from "./scheme-reporter";
import { PngSheetWriter } from "./sheet-writer";
import { Stitcher } from "./stitcher";
import { OffscreenCanvasSurfaces } from "./surfaces";

const geometry = new DeviceGeometry();
const stitcher = new Stitcher({
  // Browser functions are wrapped so they are never called with the wrong `this`.
  decoder: new DataUrlDecoder(
    (url) => fetch(url),
    (blob) => createImageBitmap(blob),
  ),
  sizer: new CutPictureSizer(
    geometry,
    new CanvasLimitCutter(MAX_PART_SIDE, MAX_PART_PIXELS),
  ),
  placing: geometry,
  surfaces: new OffscreenCanvasSurfaces(OffscreenCanvas),
  writer: new PngSheetWriter(new BlobUrls(URL)),
});
const router = new CommandRouter<OffscreenMessage>(
  {
    begin: (message) => stitcher.begin(message.width, message.height),
    slice: (message) =>
      stitcher.add(message.dataUrl, message.rects, message.scroll),
    finish: () => stitcher.finish(),
  },
  offscreenGuards,
  new OwnContextFilter(chrome.runtime.id, TARGETS.offscreen),
  new SettledResponder(),
);

chrome.runtime.onMessage.addListener(
  (message: unknown, sender, sendResponse: (reply: Reply<unknown>) => void) =>
    router.route(message, sender, sendResponse),
);

new SchemeReporter(
  window.matchMedia(DARK_SCHEME_QUERY),
  new RuntimeMessenger<BackgroundMessage>(chrome.runtime),
  (work, everyMs) => {
    window.setInterval(work, everyMs);
  },
  OFFSCREEN_CONFIG.schemeCheckMs,
).start();
