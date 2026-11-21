import { isFields } from "../../src/shared/fields";

describe("isFields", () => {
  it.each([
    { value: { a: 1 }, fields: true },
    { value: null, fields: false },
    { value: "text", fields: false },
  ])("says whether $value has fields to read", ({ value, fields }) => {
    expect(isFields(value)).toBe(fields);
  });
});
