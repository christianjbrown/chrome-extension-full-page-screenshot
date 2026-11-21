import type { Styled } from "./inline-styles";
import type { PageElement } from "./page-elements";

// The part of the viewport that scrolls, in CSS pixels.
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

// Makes the scroller for the window or for an inner element.
export interface ScrollerFactory {
  forWindow(): Scroller;
  forElement(element: PageElement): Scroller;
}

// Finds whatever scrolls the page's content.
export interface ScrollerSource {
  find(): Scroller;
}
