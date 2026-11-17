import type { SchemeState } from "../../src/background/scheme-state";
import { ToolbarScheme } from "../../src/background/toolbar-scheme";

function fakes(start: SchemeState = { device: "dark", chrome: null }) {
  let state = start;
  const memory = {
    load: vi.fn(() => Promise.resolve(state)),
    save: vi.fn((next: SchemeState) => {
      state = next;
      return Promise.resolve();
    }),
  };
  const icon = { show: vi.fn().mockResolvedValue(undefined) };
  return { memory, icon, scheme: new ToolbarScheme(memory, icon) };
}

describe("ToolbarScheme", () => {
  it("shows the device's scheme when that is all it knows", async () => {
    const { scheme, icon, memory } = fakes();

    await scheme.deviceIs("light");

    expect(memory.save).toHaveBeenCalledWith({ device: "light", chrome: null });
    expect(icon.show).toHaveBeenCalledWith("light");
  });

  it("shows what a tab saw when Chrome differs from the device", async () => {
    const { scheme, icon } = fakes({ device: "light", chrome: null });

    await scheme.tabShows("dark");

    expect(icon.show).toHaveBeenCalledWith("dark");
  });

  it("keeps showing Chrome's scheme when the device reports again", async () => {
    const { scheme, icon } = fakes({ device: "light", chrome: null });

    await scheme.tabShows("dark");
    await scheme.deviceIs("light");

    expect(icon.show).toHaveBeenLastCalledWith("dark");
  });

  it("takes reports one at a time", async () => {
    const { scheme, memory } = fakes({ device: "light", chrome: null });

    await Promise.all([scheme.tabShows("dark"), scheme.deviceIs("dark")]);

    expect(memory.save).toHaveBeenLastCalledWith({
      device: "dark",
      chrome: "dark",
    });
  });

  it("carries on after a report that could not be saved", async () => {
    const { scheme, memory, icon } = fakes();
    memory.save.mockRejectedValueOnce(new Error("quota"));

    await expect(scheme.deviceIs("light")).rejects.toThrow("quota");
    await scheme.deviceIs("light");

    expect(icon.show).toHaveBeenCalledExactlyOnceWith("light");
  });
});
