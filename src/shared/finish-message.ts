import type { TARGETS } from "./targets";

// Asks the offscreen document to write out the picture.
export const FINISH = "finish";

export interface FinishMessage {
  target: typeof TARGETS.offscreen;
  type: typeof FINISH;
}
