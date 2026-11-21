import { fieldsOf, isStringList } from "../../src/background/guards";

describe("fieldsOf", () => {
  it("reads an object's own fields", () => {
    const value = { a: 1 };

    expect(fieldsOf(value)).toBe(value);
  });

  it.each([undefined, null, 7, "text"])(
    "reads %j as having no fields",
    (value) => {
      expect(fieldsOf(value)).toEqual({});
    },
  );
});

describe("isStringList", () => {
  it.each([
    { value: [], list: true },
    { value: ["a", "b"], list: true },
    { value: ["a", 1], list: false },
    { value: "a", list: false },
    { value: null, list: false },
  ])("says whether $value is a list of strings", ({ value, list }) => {
    expect(isStringList(value)).toBe(list);
  });
});
