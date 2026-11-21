import { PNG_EXTENSION } from "../shared/png";

export interface Clock {
  now(): Date;
}

export interface NamedFile {
  url: string;
  filename: string;
}

export interface ScreenshotNamer {
  // Gives each part of the screenshot, top to bottom, its filename.
  name(title: string | undefined, urls: string[]): NamedFile[];
}

// Two digits for every part of the date and time, so names sort as text.
const DIGITS = 2;
const ZERO = "0";
const SEPARATOR = "-";
// A title longer than this is cut, so the file name stays manageable.
const MAX_TITLE_LENGTH = 80;
// The name for a page with no usable title.
const UNTITLED = "screenshot";
const PART = "-part-";
// Splits accents off their letters, then joins what is left back up.
const DECOMPOSED = "NFKD";
const COMPOSED = "NFC";
const LATIN_ACCENTS = /[\u0300-\u036f]/g;
const NOT_A_WORD = /[^\p{L}\p{N}]+/u;

function pad(number: number): string {
  return String(number).padStart(DIGITS, ZERO);
}

function kebab(text: string): string {
  const words = text
    .normalize(DECOMPOSED)
    // Latin accents only (é to e); other scripts' marks, like Japanese ペ, recombine.
    .replace(LATIN_ACCENTS, "")
    .normalize(COMPOSED)
    .toLowerCase()
    .split(NOT_A_WORD)
    .filter((word) => word !== "");
  const name = words.join(SEPARATOR).slice(0, MAX_TITLE_LENGTH);
  return name.endsWith(SEPARATOR) ? name.slice(0, -1) : name;
}

function stamp(date: Date): string {
  return [
    String(date.getFullYear()),
    // Months count from 0.
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join(SEPARATOR);
}

// "2026-10-30-14-05-my-cool-page", in the laptop's own time zone, so
// screenshots sort by when they were taken.
export class TimestampedNamer implements ScreenshotNamer {
  constructor(private readonly clock: Clock) {}

  // One part is the plain name; a page cut into parts numbers each of them.
  name(title: string | undefined, urls: string[]): NamedFile[] {
    const name = [stamp(this.clock.now()), kebab(title ?? "") || UNTITLED].join(
      SEPARATOR,
    );
    return urls.map((url, index) => ({
      url,
      filename:
        urls.length === 1
          ? `${name}${PNG_EXTENSION}`
          : `${name}${PART}${String(index + 1)}${PNG_EXTENSION}`,
    }));
  }
}
