import { FilenameListening } from "../../src/background/filename-listening";

function setUp() {
  const event = { addListener: vi.fn(), removeListener: vi.fn() };
  const listener = vi.fn();
  return { event, listener, listening: new FilenameListening(event, listener) };
}

describe("FilenameListening", () => {
  it("adds nothing until something holds it", () => {
    const { event } = setUp();

    expect(event.addListener).not.toHaveBeenCalled();
  });

  it("adds the listener on the first hold and removes it on the last release", () => {
    const { event, listener, listening } = setUp();

    listening.hold();
    expect(event.addListener).toHaveBeenCalledExactlyOnceWith(listener);

    listening.release();
    expect(event.removeListener).toHaveBeenCalledExactlyOnceWith(listener);
  });

  it("keeps the listener while overlapping holds are still open", () => {
    const { event, listener, listening } = setUp();

    listening.hold();
    listening.hold();
    listening.release();
    expect(event.addListener).toHaveBeenCalledTimes(1);
    expect(event.removeListener).not.toHaveBeenCalled();

    listening.release();
    expect(event.removeListener).toHaveBeenCalledExactlyOnceWith(listener);
  });

  it("does nothing when released with no hold open", () => {
    const { event, listener, listening } = setUp();

    listening.release();
    expect(event.removeListener).not.toHaveBeenCalled();

    listening.hold();
    expect(event.addListener).toHaveBeenCalledExactlyOnceWith(listener);
  });

  it("adds the listener again for a hold after it was removed", () => {
    const { event, listening } = setUp();

    listening.hold();
    listening.release();
    listening.hold();

    expect(event.addListener).toHaveBeenCalledTimes(2);
  });
});
