import { DomElements } from "../../src/page/page-elements";
import { fakeElement } from "./fakes";

describe("DomElements", () => {
  it("lists every element in the document", () => {
    const elements = [fakeElement(), fakeElement()];
    const querySelectorAll = vi.fn(() => new Set(elements));

    const all = new DomElements({ querySelectorAll }, vi.fn()).all();

    expect(all).toEqual(elements);
    expect(querySelectorAll).toHaveBeenCalledWith("*");
  });

  it("reads an element's computed position and overflow", () => {
    const element = fakeElement();
    const computed = vi.fn(() => ({ position: "fixed", overflowY: "auto" }));

    const look = new DomElements(
      { querySelectorAll: () => [] },
      computed,
    ).lookOf(element);

    expect(look).toEqual({ position: "fixed", overflowY: "auto" });
    expect(computed).toHaveBeenCalledWith(element);
  });
});
