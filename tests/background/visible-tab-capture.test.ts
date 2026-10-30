import {
  CAPTURE_SPACING_MS,
  ThrottledCapture,
  TimerSleeper,
} from "../../src/background/visible-tab-capture";

function setUp() {
  let now = 10_000;
  const tabs = { captureVisibleTab: vi.fn(() => Promise.resolve("data:png")) };
  const sleeper = {
    sleep: vi.fn((ms: number) => {
      now += ms;
      return Promise.resolve();
    }),
  };
  const clock = { now: () => new Date(now) };
  const advance = (ms: number) => {
    now += ms;
  };
  return {
    tabs,
    sleeper,
    advance,
    capture: new ThrottledCapture(tabs, clock, sleeper),
  };
}

describe("ThrottledCapture", () => {
  it("captures the window's visible tab as a PNG straight away the first time", async () => {
    const { tabs, sleeper, capture } = setUp();

    await expect(capture.capture(3)).resolves.toBe("data:png");
    expect(tabs.captureVisibleTab).toHaveBeenCalledWith(3, { format: "png" });
    expect(sleeper.sleep).not.toHaveBeenCalled();
  });

  it("waits out the rest of the spacing before the next capture", async () => {
    const { sleeper, advance, capture } = setUp();
    await capture.capture(3);
    advance(200);

    await capture.capture(3);

    expect(sleeper.sleep).toHaveBeenCalledWith(CAPTURE_SPACING_MS - 200);
  });

  it("does not wait when enough time has passed", async () => {
    const { sleeper, advance, capture } = setUp();
    await capture.capture(3);
    advance(CAPTURE_SPACING_MS);

    await capture.capture(3);

    expect(sleeper.sleep).not.toHaveBeenCalled();
  });
});

describe("TimerSleeper", () => {
  it("resolves after the timer fires", async () => {
    const timer = vi.fn((callback: () => void) => {
      callback();
    });

    await new TimerSleeper(timer).sleep(250);

    expect(timer).toHaveBeenCalledWith(expect.any(Function), 250);
  });
});
