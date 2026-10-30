import { StyleLedger } from "../../src/page/style-ledger";
import { fakeElement } from "./fakes";

describe("StyleLedger", () => {
  it("overrides a style with important priority", () => {
    const element = fakeElement();

    new StyleLedger().override(element, "opacity", "0");

    expect(element.style.values.get("opacity")).toEqual({
      value: "0",
      priority: "important",
    });
  });

  it("removes a property that had no inline value before", () => {
    const element = fakeElement();
    const ledger = new StyleLedger();
    ledger.override(element, "opacity", "0");

    ledger.restore();

    expect(element.style.values.has("opacity")).toBe(false);
  });

  it("puts back the original value and priority", () => {
    const element = fakeElement();
    element.style.setProperty("position", "sticky", "important");
    element.style.setProperty("top", "4px", "");
    const ledger = new StyleLedger();
    ledger.override(element, "position", "relative");
    ledger.override(element, "top", "auto");

    ledger.restore();

    expect(element.style.values.get("position")).toEqual({
      value: "sticky",
      priority: "important",
    });
    expect(element.style.values.get("top")).toEqual({
      value: "4px",
      priority: "",
    });
  });

  it("remembers the first original when the same property is overridden twice", () => {
    const element = fakeElement();
    element.style.setProperty("opacity", "0.5", "");
    const ledger = new StyleLedger();
    ledger.override(element, "opacity", "0");
    ledger.override(element, "opacity", "0.1");

    ledger.restore();

    expect(element.style.getPropertyValue("opacity")).toBe("0.5");
  });

  it("forgets everything once restored", () => {
    const element = fakeElement();
    const ledger = new StyleLedger();
    ledger.override(element, "opacity", "0");
    ledger.restore();
    element.style.setProperty("opacity", "1", "");

    ledger.restore();

    expect(element.style.getPropertyValue("opacity")).toBe("1");
  });
});
