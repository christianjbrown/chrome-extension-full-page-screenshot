import { PNG_TYPE } from "../shared/png";
import type { Bitmap, Box, Surface, SurfaceFactory } from "./surfaces";

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
  getContext(kind: typeof CONTEXT_2D): Canvas2d | null;
  convertToBlob(options: { type: string }): Promise<Blob>;
}

export type CanvasConstructor = new (
  width: number,
  height: number,
) => CanvasLike;

const CONTEXT_2D = "2d";
// A canvas shrunk to nothing gives its memory back at once.
const RELEASED = 0;

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
    const blob = await this.canvas.convertToBlob({ type: PNG_TYPE });
    this.canvas.width = RELEASED;
    this.canvas.height = RELEASED;
    return blob;
  }
}

const tooBig = (width: number, height: number): string =>
  `Chrome could not make a ${String(width)} by ${String(height)} image`;

export class OffscreenCanvasSurfaces implements SurfaceFactory {
  constructor(private readonly Canvas: CanvasConstructor) {}

  create(width: number, height: number): Surface {
    const canvas = new this.Canvas(width, height);
    const context = canvas.getContext(CONTEXT_2D);
    if (context === null) {
      throw new Error(tooBig(width, height));
    }
    return new CanvasSurface(canvas, context);
  }
}
