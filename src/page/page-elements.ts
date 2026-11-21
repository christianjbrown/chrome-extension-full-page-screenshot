import type { Styled } from "./inline-styles";

export interface ComputedLook {
  position: string;
  overflowY: string;
}

// Anything whose content can be taller than the space it shows it in.
export interface Tall {
  scrollHeight: number;
}

// The document's root as the window's scroller sees it: how tall the page is,
// and the inline style that steadies it.
export interface ScrollingRoot extends Styled, Tall {}

export interface PageElement extends ScrollingRoot {
  clientHeight: number;
  clientWidth: number;
  clientTop: number;
  clientLeft: number;
  scrollTop: number;
  getBoundingClientRect(): { top: number; left: number };
}

// Every element on the page, and how the page's styles position each one.
export interface PageElements {
  all(): PageElement[];
  lookOf(element: PageElement): ComputedLook;
}
