import { ToolbarIndicator } from "../../src/background/toolbar-indicator";

function action() {
  return {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    setTitle: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ToolbarIndicator", () => {
  it.each([
    {
      show: (indicator: ToolbarIndicator) => indicator.showIdle(),
      text: "",
      color: "#5a5a60",
      title: "Screenshot this whole page",
    },
    {
      show: (indicator: ToolbarIndicator) => indicator.showProgress(0.426),
      text: "43%",
      color: "#2563eb",
      title: "Capturing the page. Hold still.",
    },
    {
      show: (indicator: ToolbarIndicator) => indicator.showSaving(),
      text: "...",
      color: "#2563eb",
      title: "Saving the screenshot",
    },
    {
      show: (indicator: ToolbarIndicator) => indicator.showError("no access"),
      text: "!",
      color: "#dc2626",
      title: "Screenshot failed: no access",
    },
  ])("shows $title", async ({ show, text, color, title }) => {
    const toolbar = action();

    await show(new ToolbarIndicator(toolbar));

    expect(toolbar.setBadgeText).toHaveBeenCalledWith({ text });
    expect(toolbar.setBadgeBackgroundColor).toHaveBeenCalledWith({ color });
    expect(toolbar.setTitle).toHaveBeenCalledWith({ title });
  });
});
