import { PROPERTY, VALUE } from "./css";
import type { ScrollSteadier } from "./scroll-steadier";
import type { StyleOverrides, Styled } from "./style-ledger";

// Smooth scrolling would still be moving when the slice is taken, and a
// classic scrollbar would be painted into every slice, so both are turned off
// on the document and on whatever scrolls.
export class CaptureScrollStyles implements ScrollSteadier {
  constructor(
    private readonly ledger: StyleOverrides,
    private readonly root: Styled,
  ) {}

  steady(scrolling: Styled): void {
    this.ledger.override(this.root, PROPERTY.scrollBehavior, VALUE.auto);
    this.ledger.override(scrolling, PROPERTY.scrollBehavior, VALUE.auto);
    this.ledger.override(scrolling, PROPERTY.scrollbarWidth, VALUE.none);
  }
}
