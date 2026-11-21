import {
  MAX_PART_PIXELS,
  MAX_PART_SIDE,
} from "../../src/offscreen/canvas-limits";

describe("canvas limits", () => {
  it("keeps each part inside Chrome's canvas limits", () => {
    expect(MAX_PART_SIDE).toBe(16384);
    expect(MAX_PART_PIXELS).toBe(64 * 1024 * 1024);
  });
});
