import {
  VisibleImageWaiter,
  type PageImage,
} from "../../src/page/image-waiter";

function image(
  overrides: Partial<{
    complete: boolean;
    top: number;
    left: number;
    decode: () => Promise<void>;
  }> = {},
): PageImage & { decode: ReturnType<typeof vi.fn> } {
  const top = overrides.top ?? 100;
  const left = overrides.left ?? 100;
  return {
    complete: overrides.complete ?? false,
    getBoundingClientRect: () => ({
      top,
      bottom: top + 200,
      left,
      right: left + 300,
    }),
    decode: vi.fn(overrides.decode ?? (() => Promise.resolve())),
  };
}

function setUp(images: PageImage[]) {
  const timer = vi.fn();
  return {
    timer,
    waiter: new VisibleImageWaiter(
      { images },
      { innerWidth: 1000, innerHeight: 800 },
      timer,
      2000,
    ),
  };
}

describe("VisibleImageWaiter", () => {
  it("waits for images on screen that are still loading", async () => {
    const loading = image();
    const { timer, waiter } = setUp([loading]);

    await expect(waiter.waitForVisible()).resolves.toBe(true);

    expect(loading.decode).toHaveBeenCalled();
    expect(timer).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it.each([
    { name: "already loaded", picture: image({ complete: true }) },
    { name: "above the screen", picture: image({ top: -200 }) },
    { name: "below the screen", picture: image({ top: 800 }) },
    { name: "left of the screen", picture: image({ left: -300 }) },
    { name: "right of the screen", picture: image({ left: 1000 }) },
  ])("does not wait for an image $name", async ({ picture }) => {
    const { timer, waiter } = setUp([picture]);

    await expect(waiter.waitForVisible()).resolves.toBe(false);

    expect(picture.decode).not.toHaveBeenCalled();
    expect(timer).not.toHaveBeenCalled();
  });

  it("treats a broken image as finished", async () => {
    const broken = image({ decode: () => Promise.reject(new Error("bad")) });
    const { waiter } = setUp([broken]);

    await expect(waiter.waitForVisible()).resolves.toBe(true);
  });

  it("gives up on an image that takes too long", async () => {
    const stuck = image({ decode: () => new Promise(() => undefined) });
    const { timer, waiter } = setUp([stuck]);
    timer.mockImplementation((callback: () => void) => {
      callback();
    });

    await expect(waiter.waitForVisible()).resolves.toBe(true);
  });
});
