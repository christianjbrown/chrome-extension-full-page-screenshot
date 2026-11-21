import { InstanceGuard, StyledGuard } from "../../src/page/guards";

class Thing {
  readonly name = "thing";
}

const style = {
  getPropertyValue: () => "",
  getPropertyPriority: () => "",
  setProperty: () => undefined,
  removeProperty: () => "",
};

const styledThing = (value: unknown) =>
  Object.assign(new Thing(), { style: value });

describe("InstanceGuard", () => {
  it.each<{ value: unknown; matches: boolean }>([
    { value: new Thing(), matches: true },
    { value: {}, matches: false },
    { value: null, matches: false },
  ])("says whether $value is a Thing", ({ value, matches }) => {
    expect(new InstanceGuard(Thing).matches(value)).toBe(matches);
  });
});

describe("StyledGuard", () => {
  const guard = new StyledGuard(new InstanceGuard(Thing));

  it("matches one with an inline style", () => {
    expect(guard.matches(styledThing(style))).toBe(true);
  });

  it.each([
    { name: "not the right kind", value: { style } },
    { name: "with no style", value: new Thing() },
    { name: "with a style that is not one", value: styledThing("red") },
    {
      name: "with a style missing a method",
      value: styledThing({ ...style, removeProperty: undefined }),
    },
  ])("refuses one $name", ({ value }) => {
    expect(guard.matches(value)).toBe(false);
  });
});
