// Checks for what the service worker hears from its other contexts.
import { isFields, type Fields } from "../shared/fields";

// Nothing at all, or a value with no fields, reads as fields that are all missing.
const NO_FIELDS: Fields = {};

export const fieldsOf = (value: unknown): Fields =>
  isFields(value) ? value : NO_FIELDS;

const isString = (value: unknown): value is string => typeof value === "string";

export const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);
