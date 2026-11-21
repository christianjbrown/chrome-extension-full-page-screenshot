import { isPositiveNumber } from "../shared/numbers";
import type { Scaling } from "./device-geometry";
import type { Part, PartCutter } from "./part-layout";
import type { Surface } from "./surfaces";

// One part of the picture: painted while slices cover it, then written out.
export interface Sheet extends Part {
  surface?: Surface;
  url?: string;
}

// The whole screenshot in device pixels, cut into sheets top to bottom.
export interface Picture {
  width: number;
  height: number;
  scale: number;
  sheets: Sheet[];
}

export interface PageSize {
  width: number;
  height: number;
}

export interface PictureSizer {
  // The first capture's width sets the size of everything after it.
  size(captureWidth: number, page: PageSize): Picture;
}

const NO_WIDTH = "The capture has no width";

export class CutPictureSizer implements PictureSizer {
  constructor(
    private readonly scaling: Scaling,
    private readonly cutter: PartCutter,
  ) {}

  size(captureWidth: number, page: PageSize): Picture {
    if (!isPositiveNumber(captureWidth)) {
      throw new Error(NO_WIDTH);
    }
    const scale = this.scaling.scaleFor(captureWidth, page.width);
    const height = this.scaling.heightOf(page.height, scale);
    return {
      width: captureWidth,
      height,
      scale,
      sheets: this.cutter.partsFor(captureWidth, height),
    };
  }
}
