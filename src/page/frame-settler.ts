import type { Timer } from "../shared/timer";
import type { Settler } from "./settler";

export type FrameScheduler = (callback: () => void) => unknown;

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
