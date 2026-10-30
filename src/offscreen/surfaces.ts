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

// One output image being painted, in device pixels.
export interface Surface {
  // Copies a box of the image to the same columns, at targetY.
  draw(image: Bitmap, source: Box, targetY: number): void;
  // The finished PNG. The surface's memory is given back afterwards.
  toPng(): Promise<Blob>;
}

export interface SurfaceFactory {
  create(width: number, height: number): Surface;
}

export interface Canvas2d {
  drawImage(
    image: never,
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

interface CanvasLike {
  width: number;
  height: number;
  getContext(kind: "2d"): Canvas2d | null;
  convertToBlob(options: { type: string }): Promise<Blob>;
}

export type CanvasConstructor = new (
  width: number,
  height: number,
) => CanvasLike;

class CanvasSurface implements Surface {
  constructor(
    private readonly canvas: CanvasLike,
    private readonly context: Canvas2d,
  ) {}

  draw(image: Bitmap, source: Box, targetY: number): void {
    const { x, y, width, height } = source;
    this.context.drawImage(
      image as never,
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
    const blob = await this.canvas.convertToBlob({ type: "image/png" });
    this.canvas.width = 0;
    this.canvas.height = 0;
    return blob;
  }
}

export class OffscreenCanvasSurfaces implements SurfaceFactory {
  constructor(private readonly Canvas: CanvasConstructor) {}

  create(width: number, height: number): Surface {
    const canvas = new this.Canvas(width, height);
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error(
        `Chrome could not make a ${String(width)} by ${String(height)} image`,
      );
    }
    return new CanvasSurface(canvas, context);
  }
}
