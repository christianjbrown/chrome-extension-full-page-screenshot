import type {
  ComputedLook,
  PageElement,
  PageElements,
} from "../../src/page/page-elements";
import type { InlineStyle } from "../../src/page/style-ledger";
import type { WindowLike } from "../../src/page/scrollers";
import type { Mock } from "vitest";

// An inline style that behaves like CSSStyleDeclaration for the parts used.
class FakeStyle implements InlineStyle {
  readonly values = new Map<string, { value: string; priority: string }>();

  getPropertyValue(property: string): string {
    return this.values.get(property)?.value ?? "";
  }

  getPropertyPriority(property: string): string {
    return this.values.get(property)?.priority ?? "";
  }

  setProperty(property: string, value: string, priority: string): void {
    this.values.set(property, { value, priority });
  }

  removeProperty(property: string): string {
    const old = this.getPropertyValue(property);
    this.values.delete(property);
    return old;
  }
}

export interface FakeElement extends PageElement {
  style: FakeStyle;
  look: ComputedLook;
}

export function fakeElement(
  overrides: Partial<Omit<FakeElement, "style" | "look">> & {
    position?: string;
    overflowY?: string;
    rectTop?: number;
    rectLeft?: number;
  } = {},
): FakeElement {
  const { position, overflowY, rectTop, rectLeft, ...rest } = overrides;
  return {
    scrollHeight: 100,
    clientHeight: 100,
    clientWidth: 100,
    clientTop: 0,
    clientLeft: 0,
    scrollTop: 0,
    getBoundingClientRect: () => ({ top: rectTop ?? 0, left: rectLeft ?? 0 }),
    ...rest,
    style: new FakeStyle(),
    look: { position: position ?? "static", overflowY: overflowY ?? "visible" },
  };
}

export class FakeElements implements PageElements {
  constructor(public elements: FakeElement[] = []) {}

  all(): PageElement[] {
    return this.elements;
  }

  lookOf(element: PageElement): ComputedLook {
    return (element as FakeElement).look;
  }
}

export function fakeWindow(innerHeight = 800): WindowLike & {
  scrollTo: Mock<(x: number, y: number) => void>;
} {
  const window = {
    innerWidth: 1200,
    innerHeight,
    scrollX: 5,
    scrollY: 0,
    scrollTo: vi.fn((_x: number, y: number) => {
      window.scrollY = y;
    }),
  };
  return window;
}
