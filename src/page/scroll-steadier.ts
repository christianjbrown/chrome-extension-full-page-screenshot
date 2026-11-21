import type { Styled } from "./inline-styles";

// Readies whatever scrolls the page for a capture.
export interface ScrollSteadier {
  steady(scrolling: Styled): void;
}
