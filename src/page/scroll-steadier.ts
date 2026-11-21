import type { Styled } from "./style-ledger";

// Readies whatever scrolls the page for a capture.
export interface ScrollSteadier {
  steady(scrolling: Styled): void;
}
