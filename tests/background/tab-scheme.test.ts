import { TabScheme, tabPrefersDark } from "../../src/background/tab-scheme";

function scripting(result: unknown) {
  return { executeScript: vi.fn().mockResolvedValue([{ result }]) };
}

describe("TabScheme", () => {
  it("asks the tab whether it prefers dark", async () => {
    const runner = scripting(true);

    await new TabScheme(runner).read(6);

    expect(runner.executeScript).toHaveBeenCalledWith({
      target: { tabId: 6 },
      func: tabPrefersDark,
    });
  });

  it.each([
    [true, "dark"],
    [false, "light"],
  ])("reads %s as %s", async (result, scheme) => {
    expect(await new TabScheme(scripting(result)).read(6)).toBe(scheme);
  });

  it("knows nothing when the tab gave no answer", async () => {
    expect(await new TabScheme(scripting(undefined)).read(6)).toBeUndefined();
  });

  it("knows nothing when no frame answered", async () => {
    const runner = { executeScript: vi.fn().mockResolvedValue([]) };

    expect(await new TabScheme(runner).read(6)).toBeUndefined();
  });

  it("knows nothing about a tab it is not allowed into", async () => {
    const runner = {
      executeScript: vi.fn().mockRejectedValue(new Error("Cannot access")),
    };

    expect(await new TabScheme(runner).read(6)).toBeUndefined();
  });
});

describe("tabPrefersDark", () => {
  it("asks the page's own media query", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal("matchMedia", matchMedia);

    expect(tabPrefersDark()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });
});
