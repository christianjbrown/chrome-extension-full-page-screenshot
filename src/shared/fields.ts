// A message's fields, before they are checked.
export type Fields = Record<string, unknown>;

// Whether a value from another context is an object whose fields can be read.
export function isFields(value: unknown): value is Fields {
  return typeof value === "object" && value !== null;
}
