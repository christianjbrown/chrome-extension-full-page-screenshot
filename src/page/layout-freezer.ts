import type { Freezer } from "./freezer";
import type { PageElement, PageElements } from "./page-elements";
import type { PositionRule } from "./position-rule";
import type { StyleOverrides } from "./inline-styles";

// Stops headers and footers from repeating down the stitched image.
export class LayoutFreezer implements Freezer {
  private readonly rules: ReadonlyMap<string, PositionRule>;

  constructor(
    private readonly elements: PageElements,
    private readonly ledger: StyleOverrides,
    rules: readonly PositionRule[],
  ) {
    this.rules = new Map(rules.map((rule) => [rule.position, rule]));
  }

  // Pages often only make a header fixed once scrolled, so this looks again
  // each time.
  freeze(hideFixed: boolean): void {
    this.elements.all().forEach((element) => {
      this.freezeOne(element, hideFixed);
    });
  }

  // A position with no rule is left alone.
  private freezeOne(element: PageElement, hideFixed: boolean): void {
    const rule = this.rules.get(this.elements.lookOf(element).position);
    if (rule !== undefined) {
      this.apply(rule, element, hideFixed);
    }
  }

  private apply(
    rule: PositionRule,
    element: PageElement,
    hideFixed: boolean,
  ): void {
    if (!rule.applies(hideFixed)) {
      return;
    }
    rule.overrides.forEach(([property, value]) => {
      this.ledger.override(element, property, value);
    });
  }
}
