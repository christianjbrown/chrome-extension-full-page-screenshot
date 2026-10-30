// Waits for the page to repaint after a scroll, and for scroll handlers and
// lazy images to catch up, before the slice is captured.
export interface Settler {
  settle(): Promise<void>;
}

export type FrameScheduler = (callback: () => void) => unknown;
export type Timer = (callback: () => void, ms: number) => unknown;

export class FrameSettler implements Settler {
  constructor(
    private readonly nextFrame: FrameScheduler,
    private readonly timer: Timer,
    private readonly ms: number,
  ) {}

  async settle(): Promise<void> {
    await this.frame();
    await this.frame();
    await new Promise<void>((resolve) => {
      this.timer(resolve, this.ms);
    });
  }

  private frame(): Promise<void> {
    return new Promise((resolve) => {
      this.nextFrame(resolve);
    });
  }
}
