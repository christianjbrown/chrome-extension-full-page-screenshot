import { ScrollerFinder } from "../../src/page/scroller-finder";
import {
  DomScrollerFactory,
  ElementScroller,
  WindowScroller,
} from "../../src/page/scrollers";
import { FakeElements, fakeElement, fakeWindow } from "./fakes";

function find(rootHeight: number, elements: FakeElements) {
  const root = fakeElement({ scrollHeight: rootHeight });
  const window = fakeWindow(800);
  return new ScrollerFinder(
    window,
    root,
    elements,
    new DomScrollerFactory(window, root),
  ).find();
}

describe("ScrollerFinder", () => {
  it("uses the window when the page itself is taller than the viewport", () => {
    const inner = fakeElement({ scrollHeight: 900, overflowY: "auto" });

    expect(find(2000, new FakeElements([inner]))).toBeInstanceOf(
      WindowScroller,
    );
  });

  it("uses the window when nothing scrolls at all", () => {
    expect(find(800, new FakeElements([fakeElement()]))).toBeInstanceOf(
      WindowScroller,
    );
  });

  it("uses the biggest inner element that scrolls its content", () => {
    const small = fakeElement({
      scrollHeight: 900,
      clientHeight: 200,
      clientWidth: 200,
      overflowY: "scroll",
    });
    const big = fakeElement({
      scrollHeight: 4000,
      clientHeight: 700,
      clientWidth: 1000,
      overflowY: "auto",
    });
    const smaller = fakeElement({
      scrollHeight: 900,
      clientHeight: 100,
      clientWidth: 100,
      overflowY: "overlay",
    });
    const scroller = find(800, new FakeElements([small, big, smaller]));

    expect(scroller).toBeInstanceOf(ElementScroller);
    expect(scroller.styled).toBe(big);
  });

  it("skips elements that clip without scrolling, or have nothing to scroll", () => {
    const hidden = fakeElement({ scrollHeight: 900, overflowY: "hidden" });
    const short = fakeElement({ scrollHeight: 100, overflowY: "auto" });

    expect(find(800, new FakeElements([hidden, short]))).toBeInstanceOf(
      WindowScroller,
    );
  });
});

describe("ScrollerFinder with a factory of its own", () => {
  it("asks the factory for what it picked", () => {
    const window = fakeWindow(800);
    const root = fakeElement({ scrollHeight: 800 });
    const inner = fakeElement({ scrollHeight: 900, overflowY: "auto" });
    const forWindow = { styled: root } as never;
    const forElement = { styled: inner } as never;
    const factory = {
      forWindow: () => forWindow,
      forElement: () => forElement,
    };

    expect(
      new ScrollerFinder(
        window,
        root,
        new FakeElements([inner]),
        factory,
      ).find(),
    ).toBe(forElement);
    expect(
      new ScrollerFinder(window, root, new FakeElements([]), factory).find(),
    ).toBe(forWindow);
  });
});
