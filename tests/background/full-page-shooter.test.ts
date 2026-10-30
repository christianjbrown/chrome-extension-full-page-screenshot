import { SlicePlanner } from "../../src/background/capture-plan";
import { FullPageShooter } from "../../src/background/full-page-shooter";
import { fakeIndicator, fakePage, fakeStitcher } from "./fakes";

const target = { tabId: 4, windowId: 2, title: "Page" };

function setUp() {
  const page = fakePage();
  const stitcher = fakeStitcher();
  const indicator = fakeIndicator();
  let shot = 0;
  const capture = {
    capture: vi.fn(() => Promise.resolve(`data:${String(++shot)}`)),
  };
  const shooter = new FullPageShooter({
    page,
    planner: new SlicePlanner(),
    capture,
    stitcher,
    indicator,
  });
  return { page, stitcher, indicator, capture, shooter };
}

describe("FullPageShooter", () => {
  it("scrolls and captures slice by slice, and returns the stitched files", async () => {
    const { page, stitcher, indicator, capture, shooter } = setUp();

    await expect(shooter.shoot(target)).resolves.toEqual(["blob:1"]);

    expect(page.inject).toHaveBeenCalledWith(4);
    expect(stitcher.begin).toHaveBeenCalledWith(1200, 2000);
    expect(page.scrollTo.mock.calls).toEqual([
      [4, 0, false],
      [4, 800, true],
      [4, 1200, true],
    ]);
    expect(capture.capture).toHaveBeenCalledWith(2);
    const rows = (y: number, height: number) => [
      { x: 0, y, width: 1200, height },
    ];
    expect(stitcher.add.mock.calls).toEqual([
      ["data:1", rows(0, 800), 0],
      ["data:2", rows(0, 800), 800],
      ["data:3", rows(400, 400), 1200],
    ]);
    expect(indicator.showProgress.mock.calls).toEqual([[0], [1 / 3], [2 / 3]]);
    expect(page.restore).toHaveBeenCalledWith(4);
  });

  it("places a slice where the page actually scrolled to", async () => {
    const { page, stitcher, shooter } = setUp();
    page.scrollTo.mockImplementation((_tab: number, y: number) =>
      Promise.resolve(y === 1200 ? 1150 : y),
    );

    await shooter.shoot(target);

    expect(stitcher.add).toHaveBeenLastCalledWith(
      "data:3",
      [{ x: 0, y: 400, width: 1200, height: 400 }],
      1150,
    );
  });

  it("puts the page back even when a capture fails", async () => {
    const { page, capture, stitcher, shooter } = setUp();
    capture.capture.mockRejectedValueOnce(new Error("quota"));

    await expect(shooter.shoot(target)).rejects.toThrow("quota");
    expect(page.restore).toHaveBeenCalledWith(4);
    expect(stitcher.finish).not.toHaveBeenCalled();
  });

  it("keeps the real error when the page has gone and cannot be put back", async () => {
    const { page, capture, shooter } = setUp();
    capture.capture.mockRejectedValueOnce(new Error("tab closed"));
    page.restore.mockRejectedValueOnce(new Error("no receiver"));

    await expect(shooter.shoot(target)).rejects.toThrow("tab closed");
  });

  it("does not try to put back a page it could not get into", async () => {
    const { page, shooter } = setUp();
    page.inject.mockRejectedValueOnce(new Error("Cannot access contents"));

    await expect(shooter.shoot(target)).rejects.toThrow(
      "Cannot access contents",
    );
    expect(page.restore).not.toHaveBeenCalled();
  });
});
