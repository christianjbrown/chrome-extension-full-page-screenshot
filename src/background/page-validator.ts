import type { PageLayout } from "../shared/messages";
import { isFiniteNumber, isPositiveNumber } from "../shared/numbers";

// Checks what the page reports before the rest of the capture trusts it.
export interface PageValidator {
  layout(value: unknown): PageLayout;
  scroll(value: unknown): number;
}

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

export class FinitePageValidator implements PageValidator {
  layout(value: unknown): PageLayout {
    const fields = (value ?? {}) as Record<string, unknown>;
    const bad = [
      ...POSITIVE.filter((key) => !isPositiveNumber(fields[key])),
      ...NOT_NEGATIVE.filter(
        (key) => !isFiniteNumber(fields[key]) || fields[key] < 0,
      ),
    ];
    if (bad.length > 0) {
      throw new Error(
        `The page reported an unusable layout (${bad.join(", ")})`,
      );
    }
    return fields as unknown as PageLayout;
  }

  scroll(value: unknown): number {
    if (!isFiniteNumber(value)) {
      throw new Error("The page reported an unusable scroll position");
    }
    return value;
  }
}
