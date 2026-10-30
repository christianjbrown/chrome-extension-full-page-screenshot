import type { PageElement } from "./page-elements";
import type { Styled } from "./style-ledger";

export interface ScrollFrame {
  top: number;
  height: number;
  left: number;
  width: number;
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
    return {
      top: 0,
      height: this.window.innerHeight,
      left: 0,
      width: this.window.innerWidth,
    };
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

// The part of a span from start to start + size that falls within 0 to limit.
function onScreen(
  start: number,
  size: number,
  limit: number,
): { start: number; size: number } {
  const from = Math.min(limit, Math.max(0, start));
  return {
    start: from,
    size: Math.max(0, Math.min(limit, start + size) - from),
  };
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
    const box = this.element.getBoundingClientRect();
    const rows = onScreen(
      box.top + this.element.clientTop,
      this.element.clientHeight,
      this.window.innerHeight,
    );
    const columns = onScreen(
      box.left + this.element.clientLeft,
      this.element.clientWidth,
      this.window.innerWidth,
    );
    return {
      top: rows.start,
      height: rows.size,
      left: columns.start,
      width: columns.size,
    };
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
