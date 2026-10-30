import type { Styled } from "./style-ledger";

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

export interface DocumentLike {
  querySelectorAll(selectors: string): Iterable<unknown>;
}

export type StyleReader = (element: PageElement) => ComputedLook;

export class DomElements implements PageElements {
  constructor(
    private readonly document: DocumentLike,
    private readonly computed: StyleReader,
  ) {}

  all(): PageElement[] {
    return Array.from(this.document.querySelectorAll("*")) as PageElement[];
  }

  lookOf(element: PageElement): ComputedLook {
    return this.computed(element);
  }
}
