import type { Freezer } from "./freezer";
import type { PageElements } from "./page-elements";
import type { PositionRules } from "./freeze-rules";
import type { StyleOverrides } from "./inline-styles";

// Stops headers and footers from repeating down the stitched image.
export class LayoutFreezer implements Freezer {
  constructor(
    private readonly elements: PageElements,
    private readonly ledger: StyleOverrides,
    private readonly rules: PositionRules,
  ) {}

  // Pages often only make a header fixed once scrolled, so this looks again
  // each time.
  freeze(hideFixed: boolean): void {
    this.elements.all().forEach((element) => {
      const rule = this.rules.get(this.elements.lookOf(element).position);
      if (rule?.applies(hideFixed) !== true) {
        return;
      }
      rule.overrides.forEach(([property, value]) => {
        this.ledger.override(element, property, value);
      });
    });
  }
}
