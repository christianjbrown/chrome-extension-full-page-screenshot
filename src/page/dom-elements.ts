import { EVERY_ELEMENT } from "./css";
import type { ComputedLook, PageElement, PageElements } from "./page-elements";

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
    return Array.from(
      this.document.querySelectorAll(EVERY_ELEMENT),
    ) as PageElement[];
  }

  lookOf(element: PageElement): ComputedLook {
    return this.computed(element);
  }
}
