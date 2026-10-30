import { ElementScroller, WindowScroller } from "../../src/page/scrollers";
import { fakeElement, fakeWindow } from "./fakes";

describe("WindowScroller", () => {
  it("scrolls the whole viewport, keeping the horizontal position", () => {
    const window = fakeWindow(800);
    const root = fakeElement({ scrollHeight: 3000 });
    const scroller = new WindowScroller(window, root);

    scroller.scrollTo(900);

    expect(window.scrollTo).toHaveBeenCalledWith(5, 900);
    expect(scroller.position()).toBe(900);
    expect(scroller.frame()).toEqual({ top: 0, height: 800 });
    expect(scroller.scrollHeight()).toBe(3000);
    expect(scroller.styled).toBe(root);
  });
});

describe("ElementScroller", () => {
  it("scrolls the element and reports its box as the frame", () => {
    const element = fakeElement({
      scrollHeight: 5000,
      clientHeight: 600,
      clientTop: 2,
      rectTop: 60,
    });
    const scroller = new ElementScroller(element, fakeWindow(800));

    scroller.scrollTo(400);

    expect(element.scrollTop).toBe(400);
    expect(scroller.position()).toBe(400);
    expect(scroller.frame()).toEqual({ top: 62, height: 600 });
    expect(scroller.scrollHeight()).toBe(5000);
    expect(scroller.styled).toBe(element);
  });

  it("cuts the frame to the part of the element on screen", () => {
    const element = fakeElement({ clientHeight: 2000, rectTop: -50 });

    expect(new ElementScroller(element, fakeWindow(800)).frame()).toEqual({
      top: 0,
      height: 800,
    });
  });

  it("has an empty frame when the element is below the viewport", () => {
    const element = fakeElement({ clientHeight: 300, rectTop: 900 });

    expect(new ElementScroller(element, fakeWindow(800)).frame()).toEqual({
      top: 800,
      height: 0,
    });
  });
});
