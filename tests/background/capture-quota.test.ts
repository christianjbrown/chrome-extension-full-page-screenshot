import { CAPTURE_SPACING_MS } from "../../src/background/capture-quota";

describe("capture quota", () => {
  it("spaces captures a little wider than Chrome's two a second", () => {
    expect(CAPTURE_SPACING_MS).toBe(600);
  });
});
