import { tabPrefersDark } from "../../src/background/tab-probe";
import { TabScheme } from "../../src/background/tab-scheme";
import { DARK_SCHEME_QUERY } from "../../src/shared/colour-scheme";

function scripting(result: unknown) {
  return { executeScript: vi.fn().mockResolvedValue([{ result }]) };
}

const probe = vi.fn(() => true);
const tabScheme = (runner: ReturnType<typeof scripting>) =>
  new TabScheme(runner, probe, DARK_SCHEME_QUERY);

describe("TabScheme", () => {
  it("asks the tab whether it prefers dark", async () => {
    const runner = scripting(true);

    await tabScheme(runner).read(6);

    expect(runner.executeScript).toHaveBeenCalledWith({
      target: { tabId: 6 },
      func: probe,
      args: [DARK_SCHEME_QUERY],
    });
  });

  it.each([
    [true, "dark"],
    [false, "light"],
  ])("reads %s as %s", async (result, scheme) => {
    expect(await tabScheme(scripting(result)).read(6)).toBe(scheme);
  });

  it("knows nothing when the tab gave no answer", async () => {
    expect(await tabScheme(scripting(undefined)).read(6)).toBeUndefined();
  });

  it("knows nothing when no frame answered", async () => {
    const runner = { executeScript: vi.fn().mockResolvedValue([]) };

    expect(await tabScheme(runner).read(6)).toBeUndefined();
  });

  it("knows nothing about a tab it is not allowed into", async () => {
    const runner = {
      executeScript: vi.fn().mockRejectedValue(new Error("Cannot access")),
    };

    expect(await tabScheme(runner).read(6)).toBeUndefined();
  });
});

describe("tabPrefersDark", () => {
  it("asks the page's own media query", () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    vi.stubGlobal("matchMedia", matchMedia);

    expect(tabPrefersDark(DARK_SCHEME_QUERY)).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(DARK_SCHEME_QUERY);
  });
});
