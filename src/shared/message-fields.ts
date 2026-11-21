import type { Rect } from "./messages";
import { isFiniteNumber } from "./numbers";

// A message's fields, before they are checked.
export type Fields = Record<string, unknown>;

const RECT_KEYS = [
  "x",
  "y",
  "width",
  "height",
] as const satisfies readonly (keyof Rect)[];

export const isRect = (value: unknown): boolean => {
  const rect = value as Fields | null;
  return (
    typeof rect === "object" &&
    rect !== null &&
    RECT_KEYS.every((key) => isFiniteNumber(rect[key]))
  );
};
