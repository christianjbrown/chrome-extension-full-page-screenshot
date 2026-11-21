import type { CaptureTarget } from "./capture-target";

// Captures a whole page.
export interface Shooter {
  // Blob URLs of the finished PNGs, top to bottom.
  shoot(target: CaptureTarget): Promise<string[]>;
}
