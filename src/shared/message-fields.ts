import { isFields } from "./fields";
import type { Rect } from "./rect";
import { isFiniteNumber } from "./numbers";

const RECT_KEYS = [
  "x",
  "y",
  "width",
  "height",
] as const satisfies readonly (keyof Rect)[];

export const isRect = (value: unknown): boolean =>
  isFields(value) && RECT_KEYS.every((key) => isFiniteNumber(value[key]));
