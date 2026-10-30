import type { Clock } from "./screenshot-namer";

export interface VisibleTabCapture {
  capture(windowId: number): Promise<string>;
}

export interface CaptureApi {
  captureVisibleTab(
    windowId: number,
    options: { format: "png" },
  ): Promise<string>;
}

export interface Sleeper {
  sleep(ms: number): Promise<void>;
}

// Chrome allows two captureVisibleTab calls a second and fails the third, so
// captures are spaced out a little wider than that.
export const CAPTURE_SPACING_MS = 600;

export class ThrottledCapture implements VisibleTabCapture {
  private last = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly tabs: CaptureApi,
    private readonly clock: Clock,
    private readonly sleeper: Sleeper,
  ) {}

  async capture(windowId: number): Promise<string> {
    const wait = this.last + CAPTURE_SPACING_MS - this.clock.now().getTime();
    if (wait > 0) {
      await this.sleeper.sleep(wait);
    }
    this.last = this.clock.now().getTime();
    return this.tabs.captureVisibleTab(windowId, { format: "png" });
  }
}

export class TimerSleeper implements Sleeper {
  constructor(
    private readonly timer: (callback: () => void, ms: number) => unknown,
  ) {}

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.timer(resolve, ms);
    });
  }
}
