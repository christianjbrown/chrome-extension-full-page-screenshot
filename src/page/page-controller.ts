import type { PageLayout } from "../shared/messages";
import type { LayoutFreezer } from "./layout-freezer";
import type { Scroller } from "./scrollers";
import type { Settler } from "./settler";
import type { StyleLedger, Styled } from "./style-ledger";

// What the service worker asks of the page while it captures.
interface PageCommands {
  prepare(): Promise<PageLayout>;
  scrollTo(y: number, hideFixed: boolean): Promise<number>;
  restore(): Promise<void>;
}

interface ScrollerSource {
  find(): Scroller;
}

export interface PageControllerDependencies {
  scrollers: ScrollerSource;
  ledger: StyleLedger;
  freezer: LayoutFreezer;
  settler: Settler;
  root: Styled;
  viewport: { innerWidth: number; innerHeight: number };
}

interface Session {
  scroller: Scroller;
  origin: number;
}

export class PageController implements PageCommands {
  private session: Session | undefined;

  constructor(private readonly deps: PageControllerDependencies) {}

  prepare(): Promise<PageLayout> {
    const scroller = this.deps.scrollers.find();
    this.session = { scroller, origin: scroller.position() };
    // Smooth scrolling would still be moving when the slice is taken, and a
    // classic scrollbar would be painted into every slice.
    this.deps.ledger.override(this.deps.root, "scroll-behavior", "auto");
    this.deps.ledger.override(scroller.styled, "scroll-behavior", "auto");
    this.deps.ledger.override(scroller.styled, "scrollbar-width", "none");
    this.deps.freezer.freeze(false);
    const frame = scroller.frame();
    return Promise.resolve({
      viewportWidth: this.deps.viewport.innerWidth,
      viewportHeight: this.deps.viewport.innerHeight,
      frameTop: frame.top,
      frameHeight: frame.height,
      scrollHeight: scroller.scrollHeight(),
    });
  }

  async scrollTo(y: number, hideFixed: boolean): Promise<number> {
    const { scroller } = this.started();
    scroller.scrollTo(y);
    this.deps.freezer.freeze(hideFixed);
    await this.deps.settler.settle();
    return scroller.position();
  }

  // Scrolls back before the styles return, so smooth scrolling does not
  // animate the trip home.
  restore(): Promise<void> {
    if (this.session !== undefined) {
      this.session.scroller.scrollTo(this.session.origin);
      this.session = undefined;
    }
    this.deps.ledger.restore();
    return Promise.resolve();
  }

  private started(): Session {
    if (this.session === undefined) {
      throw new Error("The page was not prepared");
    }
    return this.session;
  }
}
