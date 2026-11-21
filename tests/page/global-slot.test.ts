import { GlobalSlot } from "../../src/page/global-slot";
import type { Guard } from "../../src/page/guard";
import type { Installed } from "../../src/page/reinstaller";

const installed: Installed<string> = {
  listener: "a",
  controller: { restore: () => Promise.resolve() },
};

const onlyInstalled: Guard<Installed<string>> = {
  matches: (value: unknown): value is Installed<string> => value === installed,
};

describe("GlobalSlot", () => {
  it("keeps the install under its key and finds it again", () => {
    const globals: Record<string, unknown> = {};
    const slot = new GlobalSlot(globals, "key", onlyInstalled);

    slot.set(installed);

    expect(globals.key).toBe(installed);
    expect(slot.get()).toBe(installed);
  });

  it("finds nothing when what is there is not an install", () => {
    const slot = new GlobalSlot(
      { key: "something else" },
      "key",
      onlyInstalled,
    );

    expect(slot.get()).toBeUndefined();
  });
});
