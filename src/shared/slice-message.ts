import type { Rect } from "./rect";
import type { TARGETS } from "./targets";

// Hands the offscreen document one capture and the parts of it to paint.
export const SLICE = "slice";

export interface SliceMessage {
  target: typeof TARGETS.offscreen;
  type: typeof SLICE;
  dataUrl: string;
  rects: Rect[];
  scroll: number;
}
