import { LayoutFreezer } from "../../src/page/layout-freezer";
import { PageController } from "../../src/page/page-controller";
import { WindowScroller } from "../../src/page/scrollers";
import { StyleLedger } from "../../src/page/style-ledger";
import { FakeElements, fakeElement, fakeWindow } from "./fakes";

function setUp() {
  const window = fakeWindow(800);
  window.scrollY = 1234;
  const root = fakeElement({ scrollHeight: 3000 });
  const header = fakeElement({ position: "fixed" });
  const elements = new FakeElements([header]);
  const ledger = new StyleLedger();
  const steps: string[] = [];
  const settler = {
    settle: vi.fn(() => {
      steps.push("settle");
      return Promise.resolve();
    }),
  };
  const images = {
    waitForVisible: vi.fn(() => {
      steps.push("images");
      return Promise.resolve(false);
    }),
  };
  const controller = new PageController({
    scrollers: { find: () => new WindowScroller(window, root) },
    ledger,
    freezer: new LayoutFreezer(elements, ledger),
    settler,
    images,
    root,
    viewport: window,
  });
  return { window, root, header, settler, images, steps, controller };
}

describe("PageController", () => {
  it("reports the layout and turns off smooth scrolling and scrollbars", async () => {
    const { root, controller } = setUp();

    await expect(controller.prepare()).resolves.toEqual({
      viewportWidth: 1200,
      viewportHeight: 800,
      frameTop: 0,
      frameHeight: 800,
      frameLeft: 0,
      frameWidth: 1200,
      scrollHeight: 3000,
    });
    expect(root.style.getPropertyValue("scroll-behavior")).toBe("auto");
    expect(root.style.getPropertyValue("scrollbar-width")).toBe("none");
  });

  it("scrolls, hides fixed elements when asked, waits for the page and its images, and says where it landed", async () => {
    const { window, header, settler, steps, controller } = setUp();
    await controller.prepare();
    window.scrollTo.mockImplementation(() => {
      window.scrollY = 2200;
    });

    await expect(controller.scrollTo(2400, true)).resolves.toBe(2200);
    expect(header.style.getPropertyValue("opacity")).toBe("0");
    expect(settler.settle).toHaveBeenCalled();
    expect(steps).toEqual(["settle", "images"]);
  });

  it("lets the page paint again after waiting for images", async () => {
    const { images, steps, controller } = setUp();
    images.waitForVisible.mockImplementationOnce(() => {
      steps.push("images");
      return Promise.resolve(true);
    });
    await controller.prepare();

    await controller.scrollTo(0, false);

    expect(steps).toEqual(["settle", "images", "settle"]);
  });

  it("refuses to scroll before it is prepared", async () => {
    const { controller } = setUp();

    await expect(controller.scrollTo(0, false)).rejects.toThrow(
      "The page was not prepared",
    );
  });

  it("scrolls back to where the user was, then restores the styles", async () => {
    const { window, root, header, controller } = setUp();
    await controller.prepare();
    await controller.scrollTo(800, true);
    window.scrollTo.mockImplementation(() => {
      expect(root.style.getPropertyValue("scroll-behavior")).toBe("auto");
    });

    await controller.restore();

    expect(window.scrollTo).toHaveBeenLastCalledWith(5, 1234);
    expect(root.style.values.size).toBe(0);
    expect(header.style.values.size).toBe(0);
  });

  it("restores nothing when it was never prepared", async () => {
    const { window, controller } = setUp();

    await controller.restore();

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
