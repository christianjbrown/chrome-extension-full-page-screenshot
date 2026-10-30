// The offscreen document: builds the object graph and listens for the service
// worker. It exists because a service worker cannot make a blob URL, and a full
// page PNG is far too big to download as a data URL.
import { CommandRouter } from "../shared/command-router";
import type { OffscreenMessage, Reply } from "../shared/messages";
import { BlobUrls } from "./blob-urls";
import { DataUrlDecoder } from "./image-decoder";
import { CanvasLimitCutter } from "./part-layout";
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
  urls: new BlobUrls(URL),
});
const router = new CommandRouter<OffscreenMessage>("offscreen", {
  begin: (message) => stitcher.begin(message.width, message.height),
  slice: (message) =>
    stitcher.add(message.dataUrl, message.from, message.to, message.y),
  finish: () => stitcher.finish(),
});

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse: (reply: Reply<unknown>) => void) =>
    router.route(message, sendResponse),
);
