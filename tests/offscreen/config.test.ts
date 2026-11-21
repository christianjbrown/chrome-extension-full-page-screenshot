import { OFFSCREEN_CONFIG } from "../../src/offscreen/config";

describe("offscreen config", () => {
  it("looks at the colour scheme every second", () => {
    expect(OFFSCREEN_CONFIG.schemeCheckMs).toBe(1000);
  });

  it("keeps each part inside Chrome's canvas limits", () => {
    expect(OFFSCREEN_CONFIG.maxPartSide).toBe(16384);
    expect(OFFSCREEN_CONFIG.maxPartPixels).toBe(64 * 1024 * 1024);
  });
});
