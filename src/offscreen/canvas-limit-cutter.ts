import { isNonNegativeNumber, isPositiveNumber } from "../shared/numbers";
import type { Part, PartCutter } from "./part-layout";

const BAD_SIZE = "The capture has an unusable size";

const isUsableSize = (width: number, height: number): boolean =>
  isPositiveNumber(width) && isNonNegativeNumber(height);

// Parts of at most the tallest height, top to bottom, the last one shorter.
function cut(height: number, tallest: number): Part[] {
  const parts: Part[] = [];
  for (let top = 0; top < height; top += tallest) {
    parts.push({ top, height: Math.min(tallest, height - top) });
  }
  return parts;
}

// Chrome refuses canvases past a certain size, and a full page can be far
// taller than that, so a tall page is cut into parts, each its own file.
export class CanvasLimitCutter implements PartCutter {
  constructor(
    private readonly maxSide: number,
    private readonly maxPixels: number,
  ) {}

  partsFor(width: number, height: number): Part[] {
    if (!isUsableSize(width, height)) {
      throw new Error(BAD_SIZE);
    }
    return cut(
      height,
      Math.min(this.maxSide, Math.floor(this.maxPixels / width)),
    );
  }
}
