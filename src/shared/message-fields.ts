import { isFields, type Fields } from "./fields";
import type { Reply } from "./messages";
import { isFiniteNumber } from "./numbers";
import type { Rect } from "./rect";

const RECT_KEYS = [
  "x",
  "y",
  "width",
  "height",
] as const satisfies readonly (keyof Rect)[];

export const isRect = (value: unknown): value is Rect =>
  isFields(value) && RECT_KEYS.every((key) => isFiniteNumber(value[key]));

// A value can be left out of a success, since a message drops undefined fields.
const isSuccess = (fields: Fields): boolean => fields.ok === true;

const isFailure = (fields: Fields): boolean =>
  fields.ok === false && typeof fields.error === "string";

const isAnswer = (fields: Fields): boolean =>
  isSuccess(fields) || isFailure(fields);

// Whether another context's answer is a reply a Responder sent.
export const isReply = (value: unknown): value is Reply<unknown> =>
  isFields(value) && isAnswer(value);
