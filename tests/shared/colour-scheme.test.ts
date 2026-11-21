import {
  COLOUR_SCHEMES,
  DARK,
  isColourScheme,
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

  it.each(["light", "dark"])("knows %s is a colour scheme", (value) => {
    expect(isColourScheme(value)).toBe(true);
  });

  it.each(["sepia", null, 3])("knows %s is not a colour scheme", (value) => {
    expect(isColourScheme(value)).toBe(false);
  });
});
