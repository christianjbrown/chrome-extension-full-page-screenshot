import type { PageLayout } from "../shared/messages";
import type { ImageWaiter } from "./image-waiter";
import type { Freezer } from "./freezer";
import type { PagePreparer, PageScroller } from "./page-commands";
import type { ScrollSteadier } from "./scroll-steadier";
import type { Scroller, ScrollerSource } from "./scroller";
import type { Settler } from "./settler";
import type { StyleRestoration } from "./inline-styles";
import type { Restorable } from "./restorable";
import type { Viewport } from "./viewport";

export interface PageControllerDependencies {
  scrollers: ScrollerSource;
  steadier: ScrollSteadier;
  freezer: Freezer;
  settler: Settler;
  images: ImageWaiter;
  // Puts back every style the capture overrode.
  styles: StyleRestoration;
  viewport: Viewport;
}

const NOT_PREPARED = "The page was not prepared";

interface Session {
  scroller: Scroller;
  origin: number;
}

export class PageController implements PagePreparer, PageScroller, Restorable {
  private session: Session | undefined;

  constructor(private readonly deps: PageControllerDependencies) {}

  prepare(): Promise<PageLayout> {
    const scroller = this.deps.scrollers.find();
    this.session = { scroller, origin: scroller.position() };
    this.deps.steadier.steady(scroller.styled);
    this.deps.freezer.freeze(false);
    const frame = scroller.frame();
    return Promise.resolve({
      viewportWidth: this.deps.viewport.innerWidth,
      viewportHeight: this.deps.viewport.innerHeight,
      frameTop: frame.top,
      frameHeight: frame.height,
      frameLeft: frame.left,
      frameWidth: frame.width,
      scrollHeight: scroller.scrollHeight(),
    });
  }

  async scrollTo(y: number, hideFixed: boolean): Promise<number> {
    const { scroller } = this.started();
    scroller.scrollTo(y);
    this.deps.freezer.freeze(hideFixed);
    await this.deps.settler.settle();
    // An image that has just finished loading still has to be painted.
    if (await this.deps.images.waitForVisible()) {
      await this.deps.settler.settle();
    }
    return scroller.position();
  }

  // Scrolls back before the styles return, so smooth scrolling does not
  // animate the trip home.
  restore(): Promise<void> {
    if (this.session !== undefined) {
      this.session.scroller.scrollTo(this.session.origin);
      this.session = undefined;
    }
    this.deps.styles.restore();
    return Promise.resolve();
  }

  private started(): Session {
    if (this.session === undefined) {
      throw new Error(NOT_PREPARED);
    }
    return this.session;
  }
}
