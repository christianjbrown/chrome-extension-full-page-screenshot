// What happens to the elements of each computed position on a slice. A new
// position is a new class here and one line in the root.
import { POSITION, PROPERTY, VALUE } from "./css";
import type { PositionRule } from "./position-rule";

// Sticky elements go back to where they sit in the page.
export class StickyRule implements PositionRule {
  readonly position = POSITION.sticky;
  readonly overrides = [
    [PROPERTY.position, VALUE.relative],
    [PROPERTY.inset, VALUE.auto],
  ] as const;

  applies(): boolean {
    return true;
  }
}

// Fixed ones, which already showed in the first slice, disappear from the rest.
export class FixedRule implements PositionRule {
  readonly position = POSITION.fixed;
  readonly overrides = [
    [PROPERTY.opacity, VALUE.invisible],
    [PROPERTY.transition, VALUE.none],
  ] as const;

  applies(hideFixed: boolean): boolean {
    return hideFixed;
  }
}
