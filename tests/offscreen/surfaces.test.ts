import {
  OffscreenCanvasSurfaces,
  type Canvas2d,
} from "../../src/offscreen/surfaces";
import { fakeBitmap } from "./fakes";

function canvasClass(context: Canvas2d | null) {
  const made: { width: number; height: number }[] = [];
  const blob = new Blob(["png"]);
  class Canvas {
    convertToBlob = vi.fn(() => Promise.resolve(blob));
    constructor(
      public width: number,
      public height: number,
    ) {
      made.push(this);
    }
    getContext() {
      return context;
    }
  }
  return { Canvas, made, blob };
}

describe("OffscreenCanvasSurfaces", () => {
  it("copies a box of the image into the same columns", () => {
    const context = { drawImage: vi.fn() };
    const { Canvas } = canvasClass(context);
    const image = fakeBitmap(2400, 1600);

    new OffscreenCanvasSurfaces(Canvas)
      .create(2400, 5000)
      .draw(image, { x: 500, y: 120, width: 1800, height: 1480 }, 3000);

    expect(context.drawImage).toHaveBeenCalledWith(
      image,
      500,
      120,
      1800,
      1480,
      500,
      3000,
      1800,
      1480,
    );
  });

  it("encodes a PNG and then gives the canvas memory back", async () => {
    const { Canvas, made, blob } = canvasClass({ drawImage: vi.fn() });
    const surface = new OffscreenCanvasSurfaces(Canvas).create(2400, 5000);

    await expect(surface.toPng()).resolves.toBe(blob);
    expect(
      (made[0] as unknown as InstanceType<typeof Canvas>).convertToBlob,
    ).toHaveBeenCalledWith({
      type: "image/png",
    });
    expect(made[0]).toMatchObject({ width: 0, height: 0 });
  });

  it("says so when Chrome cannot make a canvas that size", () => {
    const { Canvas } = canvasClass(null);

    expect(() => new OffscreenCanvasSurfaces(Canvas).create(10, 20)).toThrow(
      "Chrome could not make a 10 by 20 image",
    );
  });
});
