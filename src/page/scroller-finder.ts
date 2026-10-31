import type { PageElement, PageElements } from "./page-elements";
import type { Scroller, ScrollerFactory, WindowLike } from "./scrollers";

const SCROLLING = ["auto", "scroll", "overlay"];

// Picks the window when the page itself scrolls, and otherwise the biggest
// element that scrolls its own content, as web apps with a fixed shell do.
export class ScrollerFinder {
  constructor(
    private readonly window: WindowLike,
    private readonly root: PageElement,
    private readonly elements: PageElements,
    private readonly scrollers: ScrollerFactory,
  ) {}

  find(): Scroller {
    if (this.root.scrollHeight > this.window.innerHeight) {
      return this.scrollers.forWindow();
    }
    const inner = this.biggestScrollingElement();
    return inner === undefined
      ? this.scrollers.forWindow()
      : this.scrollers.forElement(inner);
  }

  private biggestScrollingElement(): PageElement | undefined {
    const area = (element: PageElement) =>
      element.clientWidth * element.clientHeight;
    return this.elements
      .all()
      .filter((element) => this.scrolls(element))
      .reduce<PageElement | undefined>(
        (best, element) =>
          best === undefined || area(element) > area(best) ? element : best,
        undefined,
      );
  }

  private scrolls(element: PageElement): boolean {
    return (
      element.scrollHeight > element.clientHeight &&
      SCROLLING.includes(this.elements.lookOf(element).overflowY)
    );
  }
}
