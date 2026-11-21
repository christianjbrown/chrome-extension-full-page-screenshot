import type { TARGETS } from "./targets";

// Asks the page to ready itself for a capture and say how it is laid out.
export const PREPARE = "prepare";

export interface PrepareMessage {
  target: typeof TARGETS.page;
  type: typeof PREPARE;
}
