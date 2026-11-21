import { OFFSCREEN_CONFIG } from "../../src/offscreen/config";

describe("offscreen config", () => {
  it("looks at the colour scheme every second", () => {
    expect(OFFSCREEN_CONFIG.schemeCheckMs).toBe(1000);
  });
});
