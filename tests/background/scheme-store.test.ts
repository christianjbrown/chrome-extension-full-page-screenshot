import { SchemeStore } from "../../src/background/scheme-store";

function area(stored: unknown) {
  return {
    get: vi.fn().mockResolvedValue({ toolbarScheme: stored }),
    set: vi.fn().mockResolvedValue(undefined),
  };
}

describe("SchemeStore", () => {
  it("loads what was saved", async () => {
    const storage = area({ device: "light", chrome: "dark" });

    const state = await new SchemeStore(storage).load();

    expect(storage.get).toHaveBeenCalledWith("toolbarScheme");
    expect(state).toEqual({ device: "light", chrome: "dark" });
  });

  it.each([undefined, null, "dark"])(
    "starts from nothing known when %s is stored",
    async (stored) => {
      const state = await new SchemeStore(area(stored)).load();

      expect(state).toEqual({ device: "dark", chrome: null });
    },
  );

  it("ignores stored values that are not colour schemes", async () => {
    const state = await new SchemeStore(
      area({ device: "sepia", chrome: 4 }),
    ).load();

    expect(state).toEqual({ device: "dark", chrome: null });
  });

  it("saves under its own key", async () => {
    const storage = area(undefined);

    await new SchemeStore(storage).save({ device: "light", chrome: null });

    expect(storage.set).toHaveBeenCalledWith({
      toolbarScheme: { device: "light", chrome: null },
    });
  });
});
