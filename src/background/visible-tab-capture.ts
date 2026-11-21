import { PNG_FORMAT } from "../shared/png";
import type { Clock } from "./screenshot-namer";

export interface VisibleTabCapture {
  capture(windowId: number): Promise<string>;
}

export interface CaptureApi {
  captureVisibleTab(
    windowId: number,
    options: { format: typeof PNG_FORMAT },
  ): Promise<string>;
}

export interface Sleeper {
  sleep(ms: number): Promise<void>;
}

export class ThrottledCapture implements VisibleTabCapture {
  private last = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly tabs: CaptureApi,
    private readonly clock: Clock,
    private readonly sleeper: Sleeper,
    // The least time between two captures.
    private readonly spacingMs: number,
  ) {}

  async capture(windowId: number): Promise<string> {
    const wait = this.last + this.spacingMs - this.clock.now().getTime();
    if (wait > 0) {
      await this.sleeper.sleep(wait);
    }
    this.last = this.clock.now().getTime();
    return this.tabs.captureVisibleTab(windowId, { format: PNG_FORMAT });
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
