import { EVERY_ELEMENT, VALUE } from "./css";
import type { Guard } from "./guard";
import type { ComputedLook, PageElement, PageElements } from "./page-elements";

export interface DocumentLike {
  querySelectorAll(selectors: string): Iterable<unknown>;
}

export type StyleReader<E> = (element: E) => ComputedLook;

// What an element the browser cannot style counts as: in the page's flow, and
// not scrolling its own content.
const UNSTYLED: ComputedLook = {
  position: VALUE.static,
  overflowY: VALUE.visible,
};

// The document's elements, as far as the guard recognises them.
export class DomElements<E extends PageElement> implements PageElements {
  constructor(
    private readonly document: DocumentLike,
    private readonly guard: Guard<E>,
    private readonly computed: StyleReader<E>,
  ) {}

  all(): PageElement[] {
    return Array.from(this.document.querySelectorAll(EVERY_ELEMENT)).filter(
      (value) => this.guard.matches(value),
    );
  }

  lookOf(element: PageElement): ComputedLook {
    return this.guard.matches(element) ? this.computed(element) : UNSTYLED;
  }
}
