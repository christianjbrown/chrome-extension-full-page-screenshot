import { ToolbarIndicator } from "../../src/background/toolbar-indicator";
import {
  FailedStage,
  ProgressStage,
  SteadyStage,
} from "../../src/background/toolbar-stages";

function action() {
  return {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    setTitle: vi.fn().mockResolvedValue(undefined),
  };
}

const look = { badge: "!", colour: "#dc2626", title: "Failed: " };

describe("ToolbarIndicator", () => {
  it("puts the button in the stage's look for its detail", async () => {
    const toolbar = action();
    const stage = { lookFor: vi.fn(() => look) };

    await new ToolbarIndicator(toolbar).show(stage, "detail");

    expect(stage.lookFor).toHaveBeenCalledWith("detail");
    expect(toolbar.setBadgeText).toHaveBeenCalledWith({ text: "!" });
    expect(toolbar.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: "#dc2626",
    });
    expect(toolbar.setTitle).toHaveBeenCalledWith({ title: "Failed: " });
  });
});

describe("SteadyStage", () => {
  it("always looks the same", () => {
    expect(new SteadyStage(look).lookFor()).toEqual(look);
  });
});

describe("ProgressStage", () => {
  it("shows how far the capture has got as a percentage", () => {
    expect(
      new ProgressStage({ colour: "#2563eb", title: "Capturing" }).lookFor(
        0.426,
      ),
    ).toEqual({
      badge: "43%",
      colour: "#2563eb",
      title: "Capturing",
    });
  });
});

describe("FailedStage", () => {
  it("says why after its own title", () => {
    expect(new FailedStage(look).lookFor("no access")).toEqual({
      ...look,
      title: "Failed: no access",
    });
  });
});
