import { POSITION, PROPERTY, VALUE } from "./css";
import type { PageElements } from "./page-elements";
import type { StyleOverrides } from "./style-ledger";

export interface Freezer {
  freeze(hideFixed: boolean): void;
}

// What happens to the elements of one computed position on a slice.
interface PositionRule {
  // Whether this slice needs the overrides at all.
  applies(hideFixed: boolean): boolean;
  overrides: readonly (readonly [property: string, value: string])[];
}

// Rules by computed position. A position with no rule is left alone.
export type PositionRules = ReadonlyMap<string, PositionRule>;

// Sticky elements go back to where they sit in the page, and fixed ones,
// which already showed in the first slice, disappear from the rest.
export const FREEZE_RULES: PositionRules = new Map<string, PositionRule>([
  [
    POSITION.sticky,
    {
      applies: () => true,
      overrides: [
        [PROPERTY.position, VALUE.relative],
        [PROPERTY.inset, VALUE.auto],
      ],
    },
  ],
  [
    POSITION.fixed,
    {
      applies: (hideFixed) => hideFixed,
      overrides: [
        [PROPERTY.opacity, VALUE.invisible],
        [PROPERTY.transition, VALUE.none],
      ],
    },
  ],
]);

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
