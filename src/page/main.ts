// The script injected into the page: builds the object graph and listens for
// the service worker. It is injected again on every click, so it first retires
// the copy a previous click left behind.
import { CommandRouter } from "../shared/command-router";
import type { PageMessage, Reply } from "../shared/messages";
import { VisibleImageWaiter } from "./image-waiter";
import { LayoutFreezer } from "./layout-freezer";
import { PageController } from "./page-controller";
import { DomElements, type PageElement } from "./page-elements";
import { ScrollerFinder } from "./scroller-finder";
import { FrameSettler } from "./settler";
import { StyleLedger } from "./style-ledger";

type Listener = (
  message: unknown,
  sender: unknown,
  reply: (reply: Reply<unknown>) => void,
) => boolean;

interface Installed {
  listener: Listener;
  controller: PageController;
}

const KEY = "__fullPageScreenshot";
const globals = globalThis as unknown as Record<string, Installed | undefined>;

const previous = globals[KEY];
if (previous !== undefined) {
  chrome.runtime.onMessage.removeListener(previous.listener);
  void previous.controller.restore();
}

const root = document.documentElement as unknown as PageElement;
// Browser functions are wrapped so they are never called with the wrong `this`.
const elements = new DomElements(document, (element) =>
  getComputedStyle(element as unknown as Element),
);
const ledger = new StyleLedger();
const controller = new PageController({
  scrollers: new ScrollerFinder(window, root, elements),
  ledger,
  freezer: new LayoutFreezer(elements, ledger),
  settler: new FrameSettler(
    (callback) => requestAnimationFrame(callback),
    (callback, ms) => setTimeout(callback, ms),
    100,
  ),
  images: new VisibleImageWaiter(
    document,
    window,
    (callback, ms) => setTimeout(callback, ms),
    2000,
  ),
  root,
  viewport: window,
});
const router = new CommandRouter<PageMessage>("page", {
  prepare: () => controller.prepare(),
  scroll: (message) => controller.scrollTo(message.y, message.hideFixed),
  restore: () => controller.restore(),
});
const listener: Listener = (message, _sender, reply) =>
  router.route(message, reply);

chrome.runtime.onMessage.addListener(listener);
globals[KEY] = { listener, controller };
