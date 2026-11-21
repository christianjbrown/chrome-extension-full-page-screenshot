import {
  FunctionGuard,
  InstalledGuard,
  InstanceGuard,
  RestorableGuard,
  StyledGuard,
} from "../../src/page/guards";

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

describe("FunctionGuard", () => {
  const guard = new FunctionGuard<(a: number, b: number) => void>(2);

  it("matches a function taking as many arguments", () => {
    expect(guard.matches((_a: number, _b: number) => undefined)).toBe(true);
  });

  it.each<unknown>([undefined, "listener", () => undefined])(
    "refuses %s",
    (value) => {
      expect(guard.matches(value)).toBe(false);
    },
  );
});

describe("RestorableGuard", () => {
  it.each<{ value: unknown; matches: boolean }>([
    { value: { restore: () => Promise.resolve() }, matches: true },
    { value: { restore: "no" }, matches: false },
    { value: null, matches: false },
  ])("says whether $value can be restored", ({ value, matches }) => {
    expect(new RestorableGuard().matches(value)).toBe(matches);
  });
});

describe("InstalledGuard", () => {
  const guard = new InstalledGuard(
    new FunctionGuard<() => void>(0),
    new RestorableGuard(),
  );
  const controller = { restore: () => Promise.resolve() };
  const listener = (): void => undefined;

  it("matches what an earlier copy left behind", () => {
    expect(guard.matches({ listener, controller })).toBe(true);
  });

  it.each([
    undefined,
    "installed",
    { listener: "no", controller },
    { listener: (_extra: unknown) => undefined, controller },
    { listener },
    { listener, controller: {} },
  ])("refuses %j", (value) => {
    expect(guard.matches(value)).toBe(false);
  });
});
