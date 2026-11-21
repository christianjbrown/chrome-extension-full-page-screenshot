import {
  afterDevice,
  afterTab,
  isColourScheme,
  SCHEME_POLICY,
  toolbarScheme,
  UNKNOWN_SCHEME,
} from "../../src/background/scheme-state";

describe("scheme state", () => {
  it("starts on the dark toolbar the manifest's icon is drawn for", () => {
    expect(toolbarScheme(UNKNOWN_SCHEME)).toBe("dark");
  });

  it("follows the device while Chrome has no setting of its own", () => {
    const state = afterDevice(UNKNOWN_SCHEME, "light");

    expect(toolbarScheme(state)).toBe("light");
  });

  it("believes a tab over the device, and remembers why", () => {
    const state = afterTab({ device: "light", chrome: null }, "dark");

    expect(state).toEqual({ device: "light", chrome: "dark" });
    expect(toolbarScheme(state)).toBe("dark");
  });

  it("keeps Chrome's own setting when the device changes", () => {
    const state = afterDevice({ device: "light", chrome: "dark" }, "dark");

    expect(toolbarScheme(afterDevice(state, "light"))).toBe("dark");
  });

  it("keeps Chrome's setting when a tab agrees with both it and the device", () => {
    const state = afterTab({ device: "dark", chrome: "dark" }, "dark");

    expect(state.chrome).toBe("dark");
  });

  it("forgets Chrome's setting when a tab sides with the device against it", () => {
    const state = afterTab({ device: "light", chrome: "dark" }, "light");

    expect(state).toEqual({ device: "light", chrome: null });
  });

  it.each(["light", "dark"])("knows %s is a colour scheme", (value) => {
    expect(isColourScheme(value)).toBe(true);
  });

  it.each(["sepia", null, 3])("knows %s is not a colour scheme", (value) => {
    expect(isColourScheme(value)).toBe(false);
  });
});

describe("SCHEME_POLICY", () => {
  it("is the scheme state functions", () => {
    expect(SCHEME_POLICY).toEqual({ afterDevice, afterTab, toolbarScheme });
  });
});
