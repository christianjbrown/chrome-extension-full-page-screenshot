// The offscreen document: builds the object graph and listens for the service
// worker. It does two jobs a service worker cannot. It stitches, because a
// service worker cannot make a blob URL and a full page PNG is far too big to
// download as a data URL. And it watches Chrome's colour scheme, because a
// service worker has no matchMedia.
import { DARK_SCHEME_QUERY } from "../shared/colour-scheme";
import { CommandRouter } from "../shared/command-router";
import { offscreenGuards } from "../shared/message-guards";
import type { OffscreenMessage, Reply } from "../shared/messages";
import { BlobUrls } from "./blob-urls";
import { OFFSCREEN_CONFIG } from "./config";
import { DataUrlDecoder } from "./image-decoder";
import { DeviceGeometry } from "./device-geometry";
import { CanvasLimitCutter } from "./part-layout";
import { SchemeReporter } from "./scheme-reporter";
import { Stitcher } from "./stitcher";
import { OffscreenCanvasSurfaces } from "./surfaces";

const stitcher = new Stitcher({
  // Browser functions are wrapped so they are never called with the wrong `this`.
  decoder: new DataUrlDecoder(
    (url) => fetch(url),
    (blob) => createImageBitmap(blob),
  ),
  cutter: new CanvasLimitCutter(),
  surfaces: new OffscreenCanvasSurfaces(OffscreenCanvas),
  geometry: new DeviceGeometry(),
  urls: new BlobUrls(URL),
});
const router = new CommandRouter<OffscreenMessage>(
  "offscreen",
  {
    begin: (message) => stitcher.begin(message.width, message.height),
    slice: (message) =>
      stitcher.add(message.dataUrl, message.rects, message.scroll),
    finish: () => stitcher.finish(),
  },
  offscreenGuards,
  chrome.runtime.id,
);

chrome.runtime.onMessage.addListener(
  (message: unknown, sender, sendResponse: (reply: Reply<unknown>) => void) =>
    router.route(message, sender, sendResponse),
);

new SchemeReporter(
  window.matchMedia(DARK_SCHEME_QUERY),
  chrome.runtime,
  (work, everyMs) => {
    window.setInterval(work, everyMs);
  },
  OFFSCREEN_CONFIG.schemeCheckMs,
).start();
