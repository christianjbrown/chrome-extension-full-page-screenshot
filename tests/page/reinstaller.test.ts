import { Reinstaller, type Installed } from "../../src/page/reinstaller";

function setUp() {
  let held: Installed<string> | undefined;
  const registry = { addListener: vi.fn(), removeListener: vi.fn() };
  const slot = {
    get: () => held,
    set: vi.fn((installed: Installed<string>) => {
      held = installed;
    }),
  };
  return { registry, slot, reinstaller: new Reinstaller(slot, registry) };
}

const installed = (listener: string) => ({
  listener,
  controller: { restore: vi.fn(() => Promise.resolve()) },
});

describe("Reinstaller", () => {
  it("registers the first copy and remembers it", () => {
    const { registry, slot, reinstaller } = setUp();
    const first = installed("a");

    reinstaller.install(first);

    expect(registry.addListener).toHaveBeenCalledWith("a");
    expect(registry.removeListener).not.toHaveBeenCalled();
    expect(slot.set).toHaveBeenCalledWith(first);
  });

  it("retires the previous copy's listener and page when injected again", () => {
    const { registry, reinstaller } = setUp();
    const first = installed("a");
    reinstaller.install(first);

    reinstaller.install(installed("b"));

    expect(registry.removeListener).toHaveBeenCalledWith("a");
    expect(first.controller.restore).toHaveBeenCalledTimes(1);
    expect(registry.addListener).toHaveBeenLastCalledWith("b");
  });
});
