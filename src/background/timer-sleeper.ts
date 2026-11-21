import type { Timer } from "../shared/timer";
import type { Sleeper } from "./sleeper";

export class TimerSleeper implements Sleeper {
  constructor(private readonly timer: Timer) {}

  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.timer(resolve, ms);
    });
  }
}
