import { ElementScroller } from "./element-scroller";
import type { PageElement, ScrollingRoot } from "./page-elements";
import type { Scroller, ScrollerFactory } from "./scroller";
import { WindowScroller, type WindowLike } from "./window-scroller";

// Makes the real scrollers, so the finder never has to name a class.
export class DomScrollerFactory implements ScrollerFactory {
  constructor(
    private readonly window: WindowLike,
    private readonly root: ScrollingRoot,
  ) {}

  forWindow(): Scroller {
    return new WindowScroller(this.window, this.root);
  }

  forElement(element: PageElement): Scroller {
    return new ElementScroller(element, this.window);
  }
}
