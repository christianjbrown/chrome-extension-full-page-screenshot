import type { TARGETS } from "./targets";

// Asks the page to scroll to the next slice, with its fixed elements hidden or not.
export const SCROLL = "scroll";

export interface ScrollMessage {
  target: typeof TARGETS.page;
  type: typeof SCROLL;
  y: number;
  hideFixed: boolean;
}
