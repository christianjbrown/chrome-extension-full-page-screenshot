import type { Mock } from "vitest";
import type { Bitmap, Surface } from "../../src/offscreen/surfaces";

export function fakeBitmap(
  width: number,
  height: number,
): Bitmap & {
  close: Mock<() => void>;
} {
  return { width, height, close: vi.fn() };
}

export interface Draw {
  sourceY: number;
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

  draw(_image: Bitmap, sourceY: number, height: number, targetY: number): void {
    this.draws.push({ sourceY, height, targetY });
  }

  toPng(): Promise<Blob> {
    this.written = true;
    return Promise.resolve(new Blob([String(this.height)]));
  }
}
