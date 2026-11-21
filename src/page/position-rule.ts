// What happens to the elements of one computed position on a slice.
export interface PositionRule {
  // The computed position the rule is for.
  readonly position: string;
  // Whether this slice needs the overrides at all.
  applies(hideFixed: boolean): boolean;
  readonly overrides: readonly (readonly [property: string, value: string])[];
}
