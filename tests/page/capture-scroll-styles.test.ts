import { CaptureScrollStyles } from "../../src/page/capture-scroll-styles";
import { StyleLedger } from "../../src/page/style-ledger";
import { fakeElement } from "./fakes";

describe("CaptureScrollStyles", () => {
  it("turns off smooth scrolling on the document and on what scrolls", () => {
    const root = fakeElement();
    const pane = fakeElement();

    new CaptureScrollStyles(new StyleLedger(), root).steady(pane);

    expect(root.style.getPropertyValue("scroll-behavior")).toBe("auto");
    expect(pane.style.getPropertyValue("scroll-behavior")).toBe("auto");
  });

  it("hides the scrollbar of what scrolls, ahead of the page's own rules", () => {
    const root = fakeElement();
    const pane = fakeElement();

    new CaptureScrollStyles(new StyleLedger(), root).steady(pane);

    expect(pane.style.getPropertyValue("scrollbar-width")).toBe("none");
    expect(pane.style.getPropertyPriority("scrollbar-width")).toBe("important");
    expect(root.style.getPropertyValue("scrollbar-width")).toBe("");
  });

  it("leaves the page as it was once the ledger restores it", () => {
    const root = fakeElement();
    const ledger = new StyleLedger();

    new CaptureScrollStyles(ledger, root).steady(root);
    ledger.restore();

    expect(root.style.values.size).toBe(0);
  });
});
