import type { Styled } from "./inline-styles";
import type { PageElement } from "./page-elements";
import type { ScrollFrame, Scroller } from "./scroller";
import type { Viewport } from "./viewport";

export interface WindowLike extends Viewport {
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
