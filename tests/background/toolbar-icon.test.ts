import { ToolbarIcon } from "../../src/background/toolbar-icon";

describe("ToolbarIcon", () => {
  it("shows the almost white icon on a dark toolbar", async () => {
    const setIcon = vi.fn().mockResolvedValue(undefined);

    await new ToolbarIcon({ setIcon }).show("dark");

    expect(setIcon).toHaveBeenCalledWith({
      path: {
        "16": "icons/on-dark/icon-16.png",
        "32": "icons/on-dark/icon-32.png",
        "48": "icons/on-dark/icon-48.png",
        "128": "icons/on-dark/icon-128.png",
      },
    });
  });

  it("shows the almost black icon on a light toolbar", async () => {
    const setIcon = vi.fn().mockResolvedValue(undefined);

    await new ToolbarIcon({ setIcon }).show("light");

    expect(setIcon).toHaveBeenCalledWith({
      path: expect.objectContaining({
        "16": "icons/on-light/icon-16.png",
      }) as unknown,
    });
  });
});
