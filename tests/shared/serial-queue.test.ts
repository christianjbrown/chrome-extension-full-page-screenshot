import { SerialQueue } from "../../src/shared/serial-queue";

describe("SerialQueue", () => {
  it("runs work one piece at a time, in the order it was asked for", async () => {
    const queue = new SerialQueue();
    const order: string[] = [];
    let finishFirst = (): void => undefined;

    const first = queue.run(async () => {
      order.push("first starts");
      await new Promise<void>((resolve) => {
        finishFirst = resolve;
      });
      order.push("first ends");
    });
    const second = queue.run(() => {
      order.push("second");
      return Promise.resolve();
    });
    await vi.waitFor(() => {
      expect(order).toEqual(["first starts"]);
    });
    finishFirst();
    await Promise.all([first, second]);

    expect(order).toEqual(["first starts", "first ends", "second"]);
  });

  it("hands back what the work made", async () => {
    await expect(new SerialQueue().run(() => Promise.resolve(7))).resolves.toBe(
      7,
    );
  });

  it("carries on after work that failed", async () => {
    const queue = new SerialQueue();

    await expect(
      queue.run(() => Promise.reject(new Error("boom"))),
    ).rejects.toThrow("boom");
    await expect(queue.run(() => Promise.resolve("next"))).resolves.toBe(
      "next",
    );
  });
});
