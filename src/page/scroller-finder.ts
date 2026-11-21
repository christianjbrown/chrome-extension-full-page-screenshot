import { SCROLLING_OVERFLOW } from "./css";
import type { PageElement, PageElements, Tall } from "./page-elements";
import type { Scroller, ScrollerFactory, ScrollerSource } from "./scroller";
import type { Viewport } from "./viewport";

const area = (element: PageElement): number =>
  element.clientWidth * element.clientHeight;

// Biggest first. The sort is stable, so of two the same size the earlier wins.
const byAreaDescending = (a: PageElement, b: PageElement): number =>
  area(b) - area(a);

// Picks the window when the page itself scrolls, and otherwise the biggest
// element that scrolls its own content, as web apps with a fixed shell do.
export class ScrollerFinder implements ScrollerSource {
  constructor(
    private readonly window: Viewport,
    private readonly root: Tall,
    private readonly elements: PageElements,
    private readonly scrollers: ScrollerFactory,
  ) {}

  find(): Scroller {
    if (this.root.scrollHeight > this.window.innerHeight) {
      return this.scrollers.forWindow();
    }
    return this.innerOrWindow(this.biggestScrollingElement());
  }

  private biggestScrollingElement(): PageElement | undefined {
    return this.elements
      .all()
      .filter((element) => this.scrolls(element))
      .toSorted(byAreaDescending)[0];
  }

  // The window when nothing inside the page scrolls either.
  private innerOrWindow(inner: PageElement | undefined): Scroller {
    return inner === undefined
      ? this.scrollers.forWindow()
      : this.scrollers.forElement(inner);
  }

  private scrolls(element: PageElement): boolean {
    return (
      element.scrollHeight > element.clientHeight &&
      SCROLLING_OVERFLOW.includes(this.elements.lookOf(element).overflowY)
    );
  }
}
