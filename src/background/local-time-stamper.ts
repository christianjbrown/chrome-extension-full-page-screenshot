import { SEPARATOR, type TimeStamper } from "./file-name-parts";

// Two digits for every part of the date and time, so names sort as text.
const DIGITS = 2;
const ZERO = "0";

const pad = (number: number): string => String(number).padStart(DIGITS, ZERO);

// "2026-10-30-14-05", in the laptop's own time zone.
export class LocalTimeStamper implements TimeStamper {
  stamp(date: Date): string {
    return [
      String(date.getFullYear()),
      // Months count from 0.
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      pad(date.getHours()),
      pad(date.getMinutes()),
    ].join(SEPARATOR);
  }
}
