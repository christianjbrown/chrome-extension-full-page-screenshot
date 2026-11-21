import { PNG_TYPE } from "../shared/png";
import type { Bitmap, Box, Surface, SurfaceFactory } from "./surfaces";

// The part of a 2D context that paints, for the kind of image it is given.
export interface Canvas2d<I> {
  drawImage(
    image: I,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
}

interface CanvasLike<I> {
  width: number;
  height: number;
  getContext(kind: typeof CONTEXT_2D): Canvas2d<I> | null;
  convertToBlob(options: { type: string }): Promise<Blob>;
}

export type CanvasConstructor<I> = new (
  width: number,
  height: number,
) => CanvasLike<I>;

const CONTEXT_2D = "2d";
// A canvas shrunk to nothing gives its memory back at once.
const RELEASED = 0;

class CanvasSurface<I extends Bitmap> implements Surface<I> {
  constructor(
    private readonly canvas: CanvasLike<I>,
    private readonly context: Canvas2d<I>,
  ) {}

  draw(image: I, source: Box, targetY: number): void {
    const { x, y, width, height } = source;
    this.context.drawImage(
      image,
      x,
      y,
      width,
      height,
      x,
      targetY,
      width,
      height,
    );
  }

  async toPng(): Promise<Blob> {
    const blob = await this.canvas.convertToBlob({ type: PNG_TYPE });
    this.canvas.width = RELEASED;
    this.canvas.height = RELEASED;
    return blob;
  }
}

const tooBig = (width: number, height: number): string =>
  `Chrome could not make a ${String(width)} by ${String(height)} image`;

export class OffscreenCanvasSurfaces<
  I extends Bitmap,
> implements SurfaceFactory<I> {
  constructor(private readonly Canvas: CanvasConstructor<I>) {}

  create(width: number, height: number): Surface<I> {
    const canvas = new this.Canvas(width, height);
    const context = canvas.getContext(CONTEXT_2D);
    if (context === null) {
      throw new Error(tooBig(width, height));
    }
    return new CanvasSurface(canvas, context);
  }
}
