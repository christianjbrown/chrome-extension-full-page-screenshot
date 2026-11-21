import { DomElements } from "../../src/page/dom-elements";
import type { Guard } from "../../src/page/guard";
import type { PageElement } from "../../src/page/page-elements";
import { fakeElement, type FakeElement } from "./fakes";

// Recognises only the elements it was given.
class KnownElements implements Guard<FakeElement> {
  constructor(private readonly known: readonly unknown[]) {}

  matches(value: unknown): value is FakeElement {
    return this.known.includes(value);
  }
}

describe("DomElements", () => {
  it("lists every element in the document the guard recognises", () => {
    const elements = [fakeElement(), fakeElement()];
    const querySelectorAll = vi.fn(() => new Set([...elements, "text"]));

    const all = new DomElements(
      { querySelectorAll },
      new KnownElements(elements),
      vi.fn(),
    ).all();

    expect(all).toEqual(elements);
    expect(querySelectorAll).toHaveBeenCalledWith("*");
  });

  it("reads an element's computed position and overflow", () => {
    const element = fakeElement();
    const computed = vi.fn(() => ({ position: "fixed", overflowY: "auto" }));

    const look = new DomElements(
      { querySelectorAll: () => [] },
      new KnownElements([element]),
      computed,
    ).lookOf(element);

    expect(look).toEqual({ position: "fixed", overflowY: "auto" });
    expect(computed).toHaveBeenCalledWith(element);
  });

  it("reads anything the guard does not recognise as unstyled", () => {
    const computed = vi.fn();
    const stranger: PageElement = fakeElement();

    const look = new DomElements(
      { querySelectorAll: () => [] },
      new KnownElements([]),
      computed,
    ).lookOf(stranger);

    expect(look).toEqual({ position: "static", overflowY: "visible" });
    expect(computed).not.toHaveBeenCalled();
  });
});
