import { isPositiveNumber } from "../shared/numbers";
import type { Scaling } from "./geometry";
import type { PartCutter } from "./part-layout";
import type { PageSize, Picture, PictureSizer } from "./picture";

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
      parts: this.cutter.partsFor(captureWidth, height),
    };
  }
}
