// The script injected into the page: builds the object graph and listens for
// the service worker. It is injected again on every click, which the
// reinstaller keeps from piling up listeners.
import { CommandRouter } from "../shared/command-router";
import type { Sender } from "../shared/message-filter";
import { OwnContextFilter } from "../shared/own-context-filter";
import { everyCommandOnce } from "../shared/every-command-once";
import type { PageMessage, Reply } from "../shared/messages";
import { TARGETS } from "../shared/targets";
import { SettledResponder } from "../shared/settled-responder";
import { CaptureScrollStyles } from "./capture-scroll-styles";
import { PAGE_CONFIG } from "./config";
import { VisibleImageWaiter } from "./visible-image-waiter";
import { FixedRule, StickyRule } from "./freeze-rules";
import { LayoutFreezer } from "./layout-freezer";
import { PageController } from "./page-controller";
import { DomElements } from "./dom-elements";
import { DomImages } from "./dom-images";
import { GlobalSlot } from "./global-slot";
import { InstalledGuard, InstanceGuard, StyledGuard } from "./guards";
import { PrepareCommand } from "./prepare-command";
import { Reinstaller } from "./reinstaller";
import { RestoreCommand } from "./restore-command";
import { ScrollCommand } from "./scroll-command";
import { ScrollerFinder } from "./scroller-finder";
import { DomScrollerFactory } from "./dom-scroller-factory";
import { FrameSettler } from "./frame-settler";
import { StyleLedger } from "./style-ledger";

type Listener = (
  message: unknown,
  sender: Sender,
  reply: (reply: Reply<unknown>) => void,
) => boolean;

// Where each copy of the script leaves its install for the next one.
const KEY = "__fullPageScreenshot";
const reinstaller = new Reinstaller<Listener>(
  new GlobalSlot(globalThis, KEY, new InstalledGuard<Listener>()),
  chrome.runtime.onMessage,
);

const root = document.documentElement;
// Browser functions are wrapped so they are never called with the wrong `this`.
const elements = new DomElements(
  document,
  new StyledGuard(new InstanceGuard(Element)),
  (element) => getComputedStyle(element),
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
  freezer: new LayoutFreezer(elements, ledger, [
    new StickyRule(),
    new FixedRule(),
  ]),
  settler: new FrameSettler(
    (callback) => requestAnimationFrame(callback),
    (callback, ms) => setTimeout(callback, ms),
    PAGE_CONFIG.settleMs,
  ),
  images: new VisibleImageWaiter(
    new DomImages(document, new InstanceGuard(HTMLImageElement)),
    window,
    (callback, ms) => setTimeout(callback, ms),
    PAGE_CONFIG.imagePatienceMs,
  ),
  styles: ledger,
  viewport: window,
});
const router = new CommandRouter<PageMessage>(
  everyCommandOnce<PageMessage>()(
    new PrepareCommand(controller),
    new ScrollCommand(controller),
    new RestoreCommand(controller),
  ),
  new OwnContextFilter(chrome.runtime.id, TARGETS.page),
  new SettledResponder(),
);
const listener: Listener = (message, sender, reply) =>
  router.route(message, sender, reply);

reinstaller.install({ listener, controller });
