import type { Clock } from "./clock";

// Makes a Date for the present moment, as the Date class itself does.
export type DateMaker = new () => Date;

export class SystemClock implements Clock {
  constructor(private readonly dates: DateMaker) {}

  now(): Date {
    return new this.dates();
  }
}
