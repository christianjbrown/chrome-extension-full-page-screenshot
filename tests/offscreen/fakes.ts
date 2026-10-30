import type { Mock } from "vitest";
import type { Bitmap, Box, Surface } from "../../src/offscreen/surfaces";

export function fakeBitmap(
  width: number,
  height: number,
): Bitmap & {
  close: Mock<() => void>;
} {
  return { width, height, close: vi.fn() };
}

export interface Draw {
  x: number;
  sourceY: number;
  width: number;
  height: number;
  targetY: number;
}

export class FakeSurface implements Surface {
  readonly draws: Draw[] = [];
  written = false;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {}

  draw(_image: Bitmap, source: Box, targetY: number): void {
    this.draws.push({
      x: source.x,
      sourceY: source.y,
      width: source.width,
      height: source.height,
      targetY,
    });
  }

  toPng(): Promise<Blob> {
    this.written = true;
    return Promise.resolve(new Blob([String(this.height)]));
  }
}
