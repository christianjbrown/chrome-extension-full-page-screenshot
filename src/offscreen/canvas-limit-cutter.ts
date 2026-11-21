import { isFiniteNumber, isPositiveNumber } from "../shared/numbers";
import type { Part, PartCutter } from "./part-layout";

const BAD_SIZE = "The capture has an unusable size";

// Chrome refuses canvases past a certain size, and a full page can be far
// taller than that, so a tall page is cut into parts, each its own file.
export class CanvasLimitCutter implements PartCutter {
  constructor(
    private readonly maxSide: number,
    private readonly maxPixels: number,
  ) {}

  partsFor(width: number, height: number): Part[] {
    if (!isPositiveNumber(width) || !isFiniteNumber(height) || height < 0) {
      throw new Error(BAD_SIZE);
    }
    const tallest = Math.min(this.maxSide, Math.floor(this.maxPixels / width));
    const parts: Part[] = [];
    for (let top = 0; top < height; top += tallest) {
      parts.push({ top, height: Math.min(tallest, height - top) });
    }
    return parts;
  }
}
