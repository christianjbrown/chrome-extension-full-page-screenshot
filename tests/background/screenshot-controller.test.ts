import { ScreenshotController } from "../../src/background/screenshot-controller";
import { fakeIndicator, fakeStitcher } from "./fakes";

const tab = { id: 4, windowId: 2, title: "Page", url: "https://a.test/" };
const target = { tabId: 4, windowId: 2, title: "Page" };

function setUp() {
  const targets = { targetFor: vi.fn(() => Promise.resolve(target)) };
  const shooter = {
    shoot: vi.fn(() => Promise.resolve(["blob:1", "blob:2"])),
  };
  const stitcher = fakeStitcher();
  const namer = {
    name: vi.fn((_title: string | undefined, urls: string[]) =>
      urls.map((url, index) => ({
        url,
        filename: `shot-${String(index)}.png`,
      })),
    ),
  };
  const saver = { save: vi.fn(() => Promise.resolve()) };
  const indicator = fakeIndicator();
  const controller = new ScreenshotController({
    targets,
    shooter,
    stitcher,
    namer,
    saver,
    indicator,
    errors: { explain: (error: unknown) => `explained: ${String(error)}` },
  });
  return { targets, shooter, stitcher, namer, saver, indicator, controller };
}

describe("ScreenshotController", () => {
  it("captures the tab, saves every part, and goes back to idle", async () => {
    const { shooter, stitcher, namer, saver, indicator, controller } = setUp();

    await controller.take(tab);

    expect(indicator.showProgress).toHaveBeenCalledWith(0);
    expect(shooter.shoot).toHaveBeenCalledWith(target);
    expect(indicator.showSaving).toHaveBeenCalled();
    expect(namer.name).toHaveBeenCalledWith("Page", ["blob:1", "blob:2"]);
    expect(saver.save.mock.calls).toEqual([
      ["blob:1", "shot-0.png"],
      ["blob:2", "shot-1.png"],
    ]);
    expect(stitcher.close).toHaveBeenCalled();
    expect(indicator.showIdle).toHaveBeenCalled();
  });

  it("shows the reason when the tab cannot be captured", async () => {
    const { targets, shooter, indicator, controller } = setUp();
    targets.targetFor.mockRejectedValueOnce(new Error("Chrome's own page"));

    await controller.take(tab);

    expect(shooter.shoot).not.toHaveBeenCalled();
    expect(indicator.showError).toHaveBeenCalledWith(
      "explained: Error: Chrome's own page",
    );
  });

  it("closes the stitcher and shows the reason when saving fails", async () => {
    const { saver, stitcher, indicator, controller } = setUp();
    saver.save.mockRejectedValueOnce(new Error("FILE_NO_SPACE"));

    await controller.take(tab);

    expect(stitcher.close).toHaveBeenCalled();
    expect(indicator.showError).toHaveBeenCalledWith(
      "explained: Error: FILE_NO_SPACE",
    );
    expect(indicator.showIdle).not.toHaveBeenCalled();
  });

  it("still reports the outcome when the stitcher cannot be closed", async () => {
    const { stitcher, indicator, controller } = setUp();
    stitcher.close.mockRejectedValueOnce(new Error("gone"));

    await controller.take(tab);

    expect(indicator.showIdle).toHaveBeenCalled();
  });

  it("ignores a second click while the first is still going, then takes the next", async () => {
    const { shooter, controller } = setUp();
    const pending: { resolve?: (urls: string[]) => void } = {};
    shooter.shoot.mockImplementationOnce(
      () =>
        new Promise<string[]>((resolve) => {
          pending.resolve = resolve;
        }),
    );

    const first = controller.take(tab);
    await controller.take(tab);
    await vi.waitFor(() => {
      expect(shooter.shoot).toHaveBeenCalledTimes(1);
    });
    pending.resolve!(["blob:1"]);
    await first;
    await controller.take(tab);

    expect(shooter.shoot).toHaveBeenCalledTimes(2);
  });
});
