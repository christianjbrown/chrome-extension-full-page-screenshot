import { isFiniteNumber, isPositiveNumber } from "../shared/numbers";

// Chrome refuses canvases past a certain size, and a full page can be far
// taller than that, so a tall page is cut into parts, each its own file.
export const MAX_PART_SIDE = 16384;
export const MAX_PART_PIXELS = 64 * 1024 * 1024;

export interface Part {
  top: number;
  height: number;
}

export interface PartCutter {
  // The parts a width by height image (in device pixels) is cut into, top to bottom.
  partsFor(width: number, height: number): Part[];
}

export class CanvasLimitCutter implements PartCutter {
  partsFor(width: number, height: number): Part[] {
    if (!isPositiveNumber(width) || !isFiniteNumber(height) || height < 0) {
      throw new Error("The capture has an unusable size");
    }
    const tallest = Math.min(
      MAX_PART_SIDE,
      Math.floor(MAX_PART_PIXELS / width),
    );
    const parts: Part[] = [];
    for (let top = 0; top < height; top += tallest) {
      parts.push({ top, height: Math.min(tallest, height - top) });
    }
    return parts;
  }
}
