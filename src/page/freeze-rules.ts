import { POSITION, PROPERTY, VALUE } from "./css";

// What happens to the elements of one computed position on a slice.
export interface PositionRule {
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
