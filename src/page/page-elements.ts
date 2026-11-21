import type { Styled } from "./inline-styles";

export interface ComputedLook {
  position: string;
  overflowY: string;
}

export interface PageElement extends Styled {
  scrollHeight: number;
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
