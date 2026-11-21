import type { Part } from "./part-layout";
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
