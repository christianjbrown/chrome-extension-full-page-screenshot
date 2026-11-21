import type { PageLayout } from "../shared/page-layout";
import type { Fields } from "../shared/fields";
import {
  isFiniteNumber,
  isNonNegativeNumber,
  isPositiveNumber,
} from "../shared/numbers";
import type { PageValidator } from "./page-validator";

const POSITIVE: (keyof PageLayout)[] = [
  "viewportWidth",
  "viewportHeight",
  "scrollHeight",
];
const NOT_NEGATIVE: (keyof PageLayout)[] = [
  "frameTop",
  "frameHeight",
  "frameLeft",
  "frameWidth",
];

const BAD_LAYOUT = "The page reported an unusable layout";
const LIST = ", ";
const BAD_SCROLL = "The page reported an unusable scroll position";

// Nothing at all reads as a layout with every field missing.
const fieldsOf = (value: unknown): Fields => (value ?? {}) as Fields;

const badKeys = (fields: Fields): (keyof PageLayout)[] => [
  ...POSITIVE.filter((key) => !isPositiveNumber(fields[key])),
  ...NOT_NEGATIVE.filter((key) => !isNonNegativeNumber(fields[key])),
];

export class FinitePageValidator implements PageValidator {
  layout(value: unknown): PageLayout {
    const fields = fieldsOf(value);
    const bad = badKeys(fields);
    if (bad.length > 0) {
      throw new Error(`${BAD_LAYOUT} (${bad.join(LIST)})`);
    }
    return fields as unknown as PageLayout;
  }

  scroll(value: unknown): number {
    if (!isFiniteNumber(value)) {
      throw new Error(BAD_SCROLL);
    }
    return value;
  }
}
