import type { PageLayout } from "../shared/page-layout";
import type { Fields } from "../shared/fields";
import { fieldsOf } from "./guards";
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

const badKeys = (fields: Fields): (keyof PageLayout)[] => [
  ...POSITIVE.filter((key) => !isPositiveNumber(fields[key])),
  ...NOT_NEGATIVE.filter((key) => !isNonNegativeNumber(fields[key])),
];

// Every field a layout has, each with a usable value.
const isLayout = (fields: Fields): fields is Fields & PageLayout =>
  badKeys(fields).length === 0;

export class FinitePageValidator implements PageValidator {
  layout(value: unknown): PageLayout {
    const fields = fieldsOf(value);
    if (!isLayout(fields)) {
      throw new Error(`${BAD_LAYOUT} (${badKeys(fields).join(LIST)})`);
    }
    return fields;
  }

  scroll(value: unknown): number {
    if (!isFiniteNumber(value)) {
      throw new Error(BAD_SCROLL);
    }
    return value;
  }
}
