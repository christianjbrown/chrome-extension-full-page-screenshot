import { QuietClick } from "../../src/background/quiet-click";

describe("QuietClick", () => {
  it("passes the click on", async () => {
    const inner = { clicked: vi.fn(() => Promise.resolve()) };

    await new QuietClick(inner).clicked({ id: 4 });

    expect(inner.clicked).toHaveBeenCalledWith({ id: 4 });
  });

  it("drops a failure, so nothing that clicked has to handle it", async () => {
    const inner = { clicked: () => Promise.reject(new Error("closed")) };

    await expect(new QuietClick(inner).clicked({ id: 4 })).resolves.toBe(
      undefined,
    );
  });
});
