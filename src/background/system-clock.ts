import type { Clock } from "./screenshot-namer";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
