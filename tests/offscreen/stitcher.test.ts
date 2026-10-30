import { CanvasLimitCutter } from "../../src/offscreen/part-layout";
import { Stitcher } from "../../src/offscreen/stitcher";
import { FakeSurface, fakeBitmap } from "./fakes";

function setUp(parts?: { top: number; height: number }[]) {
  const surfaces: FakeSurface[] = [];
  const images = [
    fakeBitmap(2400, 1600),
    fakeBitmap(2400, 1600),
    fakeBitmap(2400, 1600),
  ];
  let decoded = 0;
  const urls: Blob[] = [];
  const stitcher = new Stitcher({
    decoder: { decode: vi.fn(() => Promise.resolve(images[decoded++]!)) },
    cutter:
      parts === undefined ? new CanvasLimitCutter() : { partsFor: () => parts },
    surfaces: {
      create: vi.fn((width: number, height: number) => {
        const surface = new FakeSurface(width, height);
        surfaces.push(surface);
        return surface;
      }),
    },
    urls: {
      create: (blob: Blob) => {
        urls.push(blob);
        return `blob:${String(urls.length)}`;
      },
    },
  });
  return { stitcher, surfaces, images };
}

describe("Stitcher", () => {
  it("paints each slice at device pixels, scaled from the capture's own width", async () => {
    const { stitcher, surfaces, images } = setUp();
    await stitcher.begin(1200, 2000);

    await stitcher.add("data:1", 0, 800, 0);
    await stitcher.add("data:2", 600, 800, 1800);
    const urls = await stitcher.finish();

    expect(urls).toEqual(["blob:1"]);
    expect(surfaces).toHaveLength(1);
    expect(surfaces[0]).toMatchObject({ width: 2400, height: 4000 });
    expect(surfaces[0]!.draws).toEqual([
      { sourceY: 0, height: 1600, targetY: 0 },
      { sourceY: 1200, height: 400, targetY: 3600 },
    ]);
    expect(images[0]!.close).toHaveBeenCalled();
    expect(images[1]!.close).toHaveBeenCalled();
  });

  it("clips a slice that runs past the bottom of the page", async () => {
    const { stitcher, surfaces } = setUp();
    await stitcher.begin(1200, 1000);

    await stitcher.add("data:1", 0, 800, 600);
    await stitcher.finish();

    expect(surfaces[0]!.draws).toEqual([
      { sourceY: 0, height: 800, targetY: 1200 },
    ]);
  });

  it("paints a slice that straddles two parts into both, and writes parts out as it passes them", async () => {
    const { stitcher, surfaces } = setUp([
      { top: 0, height: 1000 },
      { top: 1000, height: 1000 },
      { top: 2000, height: 1000 },
      { top: 3000, height: 1000 },
    ]);
    await stitcher.begin(1200, 2000);

    await stitcher.add("data:1", 0, 800, 0);
    expect(surfaces.map((surface) => surface.height)).toEqual([1000, 1000]);
    await stitcher.add("data:2", 0, 800, 1200);
    expect(surfaces[0]!.written).toBe(true);
    expect(surfaces[1]!.written).toBe(true);
    expect(surfaces[1]!.draws).toEqual([
      { sourceY: 0, height: 1600, targetY: -1000 },
    ]);
    expect(surfaces[3]!.draws).toEqual([
      { sourceY: 0, height: 1600, targetY: -600 },
    ]);
    const urls = await stitcher.finish();

    expect(urls).toEqual(["blob:1", "blob:2", "blob:3", "blob:4"]);
  });

  it("skips parts no slice ever reached", async () => {
    const { stitcher } = setUp([
      { top: 0, height: 1600 },
      { top: 1600, height: 1600 },
    ]);
    await stitcher.begin(1200, 1600);

    await stitcher.add("data:1", 0, 800, 0);

    await expect(stitcher.finish()).resolves.toEqual(["blob:1"]);
  });

  it("finishes with nothing when no slice arrived", async () => {
    const { stitcher } = setUp();
    await stitcher.begin(1200, 1600);

    await expect(stitcher.finish()).resolves.toEqual([]);
  });

  it("closes the capture even when painting fails", async () => {
    const { stitcher, images } = setUp([]);
    const failing = new Stitcher({
      decoder: { decode: () => Promise.resolve(images[0]!) },
      cutter: { partsFor: () => [{ top: 0, height: 10 }] },
      surfaces: {
        create: () => {
          throw new Error("too big");
        },
      },
      urls: { create: () => "blob:x" },
    });
    await stitcher.begin(1, 1);
    await failing.begin(1200, 10);

    await expect(failing.add("data:1", 0, 800, 0)).rejects.toThrow("too big");
    expect(images[0]!.close).toHaveBeenCalled();
  });

  it("starts afresh on begin", async () => {
    const { stitcher, surfaces } = setUp();
    await stitcher.begin(1200, 800);
    await stitcher.add("data:1", 0, 800, 0);

    await stitcher.begin(600, 800);
    await stitcher.add("data:2", 0, 800, 0);

    expect(surfaces[1]).toMatchObject({ width: 2400, height: 3200 });
  });
});
