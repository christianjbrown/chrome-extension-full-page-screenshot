import type { Part } from "./part-layout";
import type { Bitmap, PngSource, Surface } from "./surfaces";

// What has been painted of one part: its surface while slices cover it, then
// the file it was written out to.
export interface SheetPaint<S extends PngSource = PngSource> {
  surface?: S;
  url?: string;
}

// One part of the picture, and what has been painted of it.
export interface Sheet<I extends Bitmap> {
  readonly part: Part;
  readonly paint: SheetPaint<Surface<I>>;
}
