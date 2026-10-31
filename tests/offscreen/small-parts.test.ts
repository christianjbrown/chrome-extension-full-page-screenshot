import { BlobUrls } from "../../src/offscreen/blob-urls";
import { DataUrlDecoder } from "../../src/offscreen/image-decoder";
import {
  CanvasLimitCutter,
  MAX_PART_PIXELS,
  MAX_PART_SIDE,
} from "../../src/offscreen/part-layout";
import { fakeBitmap } from "./fakes";

describe("DataUrlDecoder", () => {
  it("fetches the data URL and decodes it to a bitmap", async () => {
    const blob = new Blob(["x"]);
    const bitmap = fakeBitmap(10, 10);
    const fetch = vi.fn(() =>
      Promise.resolve({ blob: () => Promise.resolve(blob) }),
    );
    const createImageBitmap = vi.fn(() => Promise.resolve(bitmap));

    await expect(
      new DataUrlDecoder(fetch, createImageBitmap).decode(
        "data:image/png;base64,AA",
      ),
    ).resolves.toBe(bitmap);
    expect(fetch).toHaveBeenCalledWith("data:image/png;base64,AA");
    expect(createImageBitmap).toHaveBeenCalledWith(blob);
  });
});

describe("BlobUrls", () => {
  it("makes an object URL for the blob", () => {
    const blob = new Blob(["x"]);
    const createObjectURL = vi.fn(() => "blob:1");

    expect(new BlobUrls({ createObjectURL }).create(blob)).toBe("blob:1");
    expect(createObjectURL).toHaveBeenCalledWith(blob);
  });
});

describe("CanvasLimitCutter", () => {
  const cutter = new CanvasLimitCutter();

  it("keeps an image that fits as one part", () => {
    expect(cutter.partsFor(2400, 9000)).toEqual([{ top: 0, height: 9000 }]);
  });

  it("cuts a tall narrow image at the canvas side limit", () => {
    expect(cutter.partsFor(1000, MAX_PART_SIDE * 2 + 5)).toEqual([
      { top: 0, height: MAX_PART_SIDE },
      { top: MAX_PART_SIDE, height: MAX_PART_SIDE },
      { top: MAX_PART_SIDE * 2, height: 5 },
    ]);
  });

  it("cuts a wide image shorter, to stay under the pixel limit", () => {
    const tallest = Math.floor(MAX_PART_PIXELS / 8192);

    expect(cutter.partsFor(8192, tallest + 1)).toEqual([
      { top: 0, height: tallest },
      { top: tallest, height: 1 },
    ]);
  });

  it.each([
    [0, 100],
    [-5, 100],
    [Number.NaN, 100],
    [Infinity, 100],
    [100, Number.NaN],
    [100, -1],
    [100, Infinity],
  ])("refuses a %d by %d image", (width, height) => {
    expect(() => cutter.partsFor(width, height)).toThrow("unusable size");
  });
});
