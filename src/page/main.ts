// The script injected into the page: builds the object graph and listens for
// the service worker. It is injected again on every click, which the
// reinstaller keeps from piling up listeners.
import { CommandRouter } from "../shared/command-router";
import { OwnContextFilter } from "../shared/own-context-filter";
import { pageGuards } from "../shared/message-guards";
import { TARGETS, type PageMessage, type Reply } from "../shared/messages";
import { SettledResponder } from "../shared/settled-responder";
import { CaptureScrollStyles } from "./capture-scroll-styles";
import { PAGE_CONFIG } from "./config";
import { VisibleImageWaiter } from "./visible-image-waiter";
import { FREEZE_RULES } from "./freeze-rules";
import { LayoutFreezer } from "./layout-freezer";
import { PageController } from "./page-controller";
import { DomElements } from "./dom-elements";
import type { PageElement } from "./page-elements";
import { Reinstaller, type Installed } from "./reinstaller";
import { ScrollerFinder } from "./scroller-finder";
import { DomScrollerFactory } from "./dom-scroller-factory";
import { FrameSettler } from "./frame-settler";
import { StyleLedger } from "./style-ledger";

type Listener = (
  message: unknown,
  sender: unknown,
  reply: (reply: Reply<unknown>) => void,
) => boolean;

const KEY = "__fullPageScreenshot";
const globals = globalThis as unknown as Record<
  string,
  Installed<Listener> | undefined
>;
const reinstaller = new Reinstaller<Listener>(
  {
    get: () => globals[KEY],
    set: (installed) => {
      globals[KEY] = installed;
    },
  },
  {
    add: (listener) => {
      chrome.runtime.onMessage.addListener(listener);
    },
    remove: (listener) => {
      chrome.runtime.onMessage.removeListener(listener);
    },
  },
);

const root = document.documentElement as unknown as PageElement;
// Browser functions are wrapped so they are never called with the wrong `this`.
const elements = new DomElements(document, (element) =>
  getComputedStyle(element as unknown as Element),
);
const ledger = new StyleLedger();
const controller = new PageController({
  scrollers: new ScrollerFinder(
    window,
    root,
    elements,
    new DomScrollerFactory(window, root),
  ),
  steadier: new CaptureScrollStyles(ledger, root),
  freezer: new LayoutFreezer(elements, ledger, FREEZE_RULES),
  settler: new FrameSettler(
    (callback) => requestAnimationFrame(callback),
    (callback, ms) => setTimeout(callback, ms),
    PAGE_CONFIG.settleMs,
  ),
  images: new VisibleImageWaiter(
    document,
    window,
    (callback, ms) => setTimeout(callback, ms),
    PAGE_CONFIG.imagePatienceMs,
  ),
  styles: ledger,
  viewport: window,
});
const router = new CommandRouter<PageMessage>(
  {
    prepare: () => controller.prepare(),
    scroll: (message) => controller.scrollTo(message.y, message.hideFixed),
    restore: () => controller.restore(),
  },
  pageGuards,
  new OwnContextFilter(chrome.runtime.id, TARGETS.page),
  new SettledResponder(),
);
const listener: Listener = (message, sender, reply) =>
  router.route(message, sender as { id?: string }, reply);

reinstaller.install({ listener, controller });
