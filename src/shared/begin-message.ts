import type { TARGETS } from "./targets";

// Asks the offscreen document to start a picture of the page's size.
export const BEGIN = "begin";

export interface BeginMessage {
  target: typeof TARGETS.offscreen;
  type: typeof BEGIN;
  width: number;
  height: number;
}
