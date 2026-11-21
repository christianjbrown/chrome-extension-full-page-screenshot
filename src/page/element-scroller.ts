import type { Styled } from "./inline-styles";
import type { PageElement } from "./page-elements";
import type { ScrollFrame, Scroller } from "./scroller";
import type { Viewport } from "./viewport";

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
    private readonly window: Viewport,
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
