import type { Part } from "./part-layout";
import type { Bitmap, Surface } from "./surfaces";

// One part of the picture: painted while slices cover it, then written out.
export interface Sheet<I extends Bitmap> extends Part {
  surface?: Surface<I>;
  url?: string;
}

// The whole screenshot in device pixels, cut into sheets top to bottom.
export interface Picture<I extends Bitmap> {
  width: number;
  height: number;
  scale: number;
  sheets: Sheet<I>[];
}

export interface PageSize {
  width: number;
  height: number;
}

export interface PictureSizer {
  // The first capture's width sets the size of everything after it.
  size<I extends Bitmap>(captureWidth: number, page: PageSize): Picture<I>;
}
