import { BACKGROUND_CONFIG } from "../../src/background/config";

describe("background config", () => {
  it("caps a capture at a page height and a number of slices", () => {
    expect(BACKGROUND_CONFIG.maxPageHeight).toBe(60000);
    expect(BACKGROUND_CONFIG.maxSlices).toBe(1000);
  });

  it("steps the whole viewport past scrollers under 100 pixels tall", () => {
    expect(BACKGROUND_CONFIG.minFrameHeight).toBe(100);
  });

  it("cuts a title to 80 characters in the file name", () => {
    expect(BACKGROUND_CONFIG.maxTitleLength).toBe(80);
  });
});
