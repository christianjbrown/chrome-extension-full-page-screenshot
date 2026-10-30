import { LayoutFreezer } from "../../src/page/layout-freezer";
import { StyleLedger } from "../../src/page/style-ledger";
import { FakeElements, fakeElement } from "./fakes";

function setUp() {
  const sticky = fakeElement({ position: "sticky" });
  const fixed = fakeElement({ position: "fixed" });
  const plain = fakeElement();
  const elements = new FakeElements([sticky, fixed, plain]);
  const ledger = new StyleLedger();
  return {
    sticky,
    fixed,
    plain,
    elements,
    ledger,
    freezer: new LayoutFreezer(elements, ledger),
  };
}

describe("LayoutFreezer", () => {
  it("puts sticky elements back in the flow of the page", () => {
    const { sticky, freezer } = setUp();

    freezer.freeze(false);

    expect(sticky.style.getPropertyValue("position")).toBe("relative");
    expect(sticky.style.getPropertyValue("inset")).toBe("auto");
  });

  it("leaves fixed elements showing for the first slice", () => {
    const { fixed, freezer } = setUp();

    freezer.freeze(false);

    expect(fixed.style.values.size).toBe(0);
  });

  it("hides fixed elements without a fade for later slices", () => {
    const { fixed, plain, freezer } = setUp();

    freezer.freeze(true);

    expect(fixed.style.getPropertyValue("opacity")).toBe("0");
    expect(fixed.style.getPropertyValue("transition")).toBe("none");
    expect(plain.style.values.size).toBe(0);
  });

  it("catches elements that only became fixed after scrolling", () => {
    const { elements, ledger, freezer } = setUp();
    freezer.freeze(true);
    const header = fakeElement({ position: "fixed" });
    elements.elements.push(header);

    freezer.freeze(true);

    expect(header.style.getPropertyValue("opacity")).toBe("0");
    ledger.restore();
    expect(header.style.values.size).toBe(0);
  });
});
