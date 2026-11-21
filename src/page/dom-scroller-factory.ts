import type { PageElement } from "./page-elements";
import type { Scroller, ScrollerFactory } from "./scroller";

// Make the real scrollers. The root passes them in, so no class here names
// another.
export type WindowScrollerMaker = () => Scroller;
export type ElementScrollerMaker = (element: PageElement) => Scroller;

// Makes the real scrollers, so the finder never has to name a class.
export class DomScrollerFactory implements ScrollerFactory {
  constructor(
    private readonly windowScroller: WindowScrollerMaker,
    private readonly elementScroller: ElementScrollerMaker,
  ) {}

  forWindow(): Scroller {
    return this.windowScroller();
  }

  forElement(element: PageElement): Scroller {
    return this.elementScroller(element);
  }
}
