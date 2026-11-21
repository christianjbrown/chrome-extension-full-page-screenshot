// A decoded capture, ready to paint from.
export interface Bitmap {
  readonly width: number;
  readonly height: number;
  close(): void;
}

// A box in an image, in device pixels.
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Something painted that can be encoded as a PNG once. Its memory is given
// back afterwards.
export interface PngSource {
  toPng(): Promise<Blob>;
}

// One output image being painted, in device pixels. It paints the kind of
// image the decoder makes, so the two always agree on what an image is.
export interface Surface<I extends Bitmap> extends PngSource {
  // Copies a box of the image to the same columns, at targetY.
  draw(image: I, source: Box, targetY: number): void;
}

export interface SurfaceFactory<I extends Bitmap> {
  create(width: number, height: number): Surface<I>;
}
