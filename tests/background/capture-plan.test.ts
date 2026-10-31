import {
  MAX_PAGE_HEIGHT,
  SlicePlanner,
} from "../../src/background/capture-plan";

const plan = (layout: {
  viewportHeight?: number;
  frameTop?: number;
  frameHeight?: number;
  frameLeft?: number;
  frameWidth?: number;
  scrollHeight: number;
}) =>
  new SlicePlanner().plan({
    viewportWidth: 1200,
    viewportHeight: layout.viewportHeight ?? 1000,
    frameTop: layout.frameTop ?? 0,
    frameHeight: layout.frameHeight ?? 1000,
    frameLeft: layout.frameLeft ?? 0,
    frameWidth: layout.frameWidth ?? 1200,
    scrollHeight: layout.scrollHeight,
  });

const across = (y: number, height: number) => ({
  x: 0,
  y,
  width: 1200,
  height,
});

describe("SlicePlanner", () => {
  it("takes a page that fits in one slice", () => {
    expect(plan({ scrollHeight: 1000 })).toEqual({
      width: 1200,
      height: 1000,
      slices: [{ scroll: 0, rects: [across(0, 1000)] }],
    });
  });

  it("takes a page shorter than the viewport in one slice", () => {
    expect(plan({ scrollHeight: 400 }).height).toBe(1000);
  });

  it("scrolls a viewport at a time, and the last slice adds only new rows", () => {
    expect(plan({ scrollHeight: 2500 })).toEqual({
      width: 1200,
      height: 2500,
      slices: [
        { scroll: 0, rects: [across(0, 1000)] },
        { scroll: 1000, rects: [across(0, 1000)] },
        { scroll: 1500, rects: [across(500, 500)] },
      ],
    });
  });

  it("needs no partial slice when the page is an exact number of viewports", () => {
    expect(plan({ scrollHeight: 2000 }).slices).toEqual([
      { scroll: 0, rects: [across(0, 1000)] },
      { scroll: 1000, rects: [across(0, 1000)] },
    ]);
  });

  it("scrolls an inner frame, taking what is above it first and below it last", () => {
    expect(
      plan({ frameTop: 100, frameHeight: 800, scrollHeight: 2000 }),
    ).toEqual({
      width: 1200,
      height: 2200,
      slices: [
        { scroll: 0, rects: [across(0, 900)] },
        { scroll: 800, rects: [across(100, 800)] },
        { scroll: 1200, rects: [across(500, 400), across(900, 100)] },
      ],
    });
  });

  it("takes what sits beside an inner frame only once, in the first slice", () => {
    const framed = (y: number, height: number) => ({
      x: 250,
      y,
      width: 700,
      height,
    });

    expect(
      plan({
        frameTop: 64,
        frameHeight: 936,
        frameLeft: 250,
        frameWidth: 700,
        scrollHeight: 2000,
      }).slices,
    ).toEqual([
      { scroll: 0, rects: [across(0, 1000)] },
      { scroll: 936, rects: [framed(64, 936)] },
      { scroll: 1064, rects: [framed(872, 128)] },
    ]);
  });

  it("does not scroll a frame that is off screen", () => {
    expect(
      plan({ frameTop: 1000, frameHeight: 0, scrollHeight: 5000 }).slices,
    ).toEqual([{ scroll: 0, rects: [across(0, 1000)] }]);
  });

  it("stops at the height cap on a page that goes on and on", () => {
    const capped = plan({ scrollHeight: 1_000_000 });

    expect(capped.height).toBe(MAX_PAGE_HEIGHT);
    expect(capped.slices.at(-1)!.scroll).toBe(MAX_PAGE_HEIGHT - 1000);
  });

  it("steps the whole viewport when the scroller is only a sliver", () => {
    const result = plan({ frameTop: 50, frameHeight: 2, scrollHeight: 3000 });

    expect(result.slices.length).toBeLessThan(10);
    expect(result.slices[0]?.rects[0]).toMatchObject({ y: 0 });
  });

  it("refuses a page that would need thousands of slices", () => {
    expect(() =>
      plan({ viewportHeight: 1, frameHeight: 1, scrollHeight: 1e9 }),
    ).toThrow("too long");
  });

  it("does not loop when the viewport has no height", () => {
    expect(
      plan({ viewportHeight: 0, frameHeight: 0.5, scrollHeight: 5000 }).slices,
    ).toHaveLength(1);
  });
});
