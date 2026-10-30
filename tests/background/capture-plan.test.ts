import {
  MAX_PAGE_HEIGHT,
  SlicePlanner,
} from "../../src/background/capture-plan";

const plan = (layout: {
  viewportHeight?: number;
  frameTop?: number;
  frameHeight?: number;
  scrollHeight: number;
}) =>
  new SlicePlanner().plan({
    viewportWidth: 1200,
    viewportHeight: layout.viewportHeight ?? 1000,
    frameTop: layout.frameTop ?? 0,
    frameHeight: layout.frameHeight ?? 1000,
    scrollHeight: layout.scrollHeight,
  });

describe("SlicePlanner", () => {
  it("takes a page that fits in one slice", () => {
    expect(plan({ scrollHeight: 1000 })).toEqual({
      width: 1200,
      height: 1000,
      slices: [{ scroll: 0, from: 0, to: 1000 }],
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
        { scroll: 0, from: 0, to: 1000 },
        { scroll: 1000, from: 0, to: 1000 },
        { scroll: 1500, from: 500, to: 1000 },
      ],
    });
  });

  it("needs no partial slice when the page is an exact number of viewports", () => {
    expect(plan({ scrollHeight: 2000 }).slices).toEqual([
      { scroll: 0, from: 0, to: 1000 },
      { scroll: 1000, from: 0, to: 1000 },
    ]);
  });

  it("scrolls an inner frame, taking what is above it first and below it last", () => {
    expect(
      plan({ frameTop: 100, frameHeight: 800, scrollHeight: 2000 }),
    ).toEqual({
      width: 1200,
      height: 2200,
      slices: [
        { scroll: 0, from: 0, to: 900 },
        { scroll: 800, from: 100, to: 900 },
        { scroll: 1200, from: 500, to: 1000 },
      ],
    });
  });

  it("does not scroll a frame that is off screen", () => {
    expect(
      plan({ frameTop: 1000, frameHeight: 0, scrollHeight: 5000 }).slices,
    ).toEqual([{ scroll: 0, from: 0, to: 1000 }]);
  });

  it("stops at the height cap on a page that goes on and on", () => {
    const capped = plan({ scrollHeight: 1_000_000 });

    expect(capped.height).toBe(MAX_PAGE_HEIGHT);
    expect(capped.slices.at(-1)!.scroll).toBe(MAX_PAGE_HEIGHT - 1000);
  });
});
