import type { PageElement } from "./page-elements";
import type { Styled } from "./style-ledger";

export interface ScrollFrame {
  top: number;
  height: number;
}

// Whatever actually scrolls the page's content: the window, or an inner element.
export interface Scroller {
  readonly styled: Styled;
  frame(): ScrollFrame;
  scrollHeight(): number;
  position(): number;
  scrollTo(y: number): void;
}

export interface WindowLike {
  innerWidth: number;
  innerHeight: number;
  scrollX: number;
  scrollY: number;
  scrollTo(x: number, y: number): void;
}

export class WindowScroller implements Scroller {
  constructor(
    private readonly window: WindowLike,
    private readonly root: PageElement,
  ) {}

  get styled(): Styled {
    return this.root;
  }

  frame(): ScrollFrame {
    return { top: 0, height: this.window.innerHeight };
  }

  scrollHeight(): number {
    return this.root.scrollHeight;
  }

  position(): number {
    return this.window.scrollY;
  }

  scrollTo(y: number): void {
    this.window.scrollTo(this.window.scrollX, y);
  }
}

export class ElementScroller implements Scroller {
  constructor(
    private readonly element: PageElement,
    private readonly window: WindowLike,
  ) {}

  get styled(): Styled {
    return this.element;
  }

  // The element's padding box, cut to the part that is on screen.
  frame(): ScrollFrame {
    const viewport = this.window.innerHeight;
    const top = Math.min(
      viewport,
      Math.max(
        0,
        this.element.getBoundingClientRect().top + this.element.clientTop,
      ),
    );
    return { top, height: Math.min(this.element.clientHeight, viewport - top) };
  }

  scrollHeight(): number {
    return this.element.scrollHeight;
  }

  position(): number {
    return this.element.scrollTop;
  }

  scrollTo(y: number): void {
    this.element.scrollTop = y;
  }
}
