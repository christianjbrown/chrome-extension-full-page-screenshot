import {
  COLOUR_SCHEMES,
  DARK,
  LIGHT,
  schemeFor,
} from "../../src/shared/colour-scheme";

describe("colour schemes", () => {
  it("are light and dark", () => {
    expect(COLOUR_SCHEMES).toEqual([LIGHT, DARK]);
  });

  it.each([
    [true, DARK],
    [false, LIGHT],
  ])("reads a dark preference of %s as %s", (prefersDark, scheme) => {
    expect(schemeFor(prefersDark)).toBe(scheme);
  });
});
