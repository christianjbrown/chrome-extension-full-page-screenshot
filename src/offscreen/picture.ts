import type { Part } from "./part-layout";

// The whole screenshot in device pixels, cut into parts top to bottom.
export interface Picture {
  width: number;
  height: number;
  scale: number;
  parts: Part[];
}

export interface PageSize {
  width: number;
  height: number;
}

export interface PictureSizer {
  // The first capture's width sets the size of everything after it.
  size(captureWidth: number, page: PageSize): Picture;
}
