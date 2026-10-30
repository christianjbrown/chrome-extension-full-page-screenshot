import type { PageElement, PageElements } from "./page-elements";
import {
  ElementScroller,
  WindowScroller,
  type Scroller,
  type WindowLike,
} from "./scrollers";

const SCROLLING = ["auto", "scroll", "overlay"];

// Picks the window when the page itself scrolls, and otherwise the biggest
// element that scrolls its own content, as web apps with a fixed shell do.
export class ScrollerFinder {
  constructor(
    private readonly window: WindowLike,
    private readonly root: PageElement,
    private readonly elements: PageElements,
  ) {}

  find(): Scroller {
    if (this.root.scrollHeight > this.window.innerHeight) {
      return new WindowScroller(this.window, this.root);
    }
    const inner = this.biggestScrollingElement();
    return inner === undefined
      ? new WindowScroller(this.window, this.root)
      : new ElementScroller(inner, this.window);
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
