// The two pieces of a screenshot's file name, joined by the same separator.
export const SEPARATOR = "-";

// Two digits for every part of the date and time, so names sort as text.
const DIGITS = 2;
const ZERO = "0";

// Splits accents off their letters, then joins what is left back up.
const DECOMPOSED = "NFKD";
const COMPOSED = "NFC";
// Latin accents only (é to e); other scripts' marks, like Japanese ペ, recombine.
const LATIN_ACCENTS = /[\u0300-\u036f]/g;
const NOT_A_WORD = /[^\p{L}\p{N}]+/u;

// Turns a page title into the words of a file name.
export interface TitleSlugger {
  // Empty when the title has no letters or digits in it.
  slug(title: string): string;
}

// Says when a screenshot was taken in a form that sorts as text.
export interface TimeStamper {
  stamp(date: Date): string;
}

// "My Cool Page | YouTube" to "my-cool-page-youtube", cut to a length.
export class KebabSlugger implements TitleSlugger {
  constructor(private readonly maxLength: number) {}

  slug(title: string): string {
    const words = title
      .normalize(DECOMPOSED)
      .replace(LATIN_ACCENTS, "")
      .normalize(COMPOSED)
      .toLowerCase()
      .split(NOT_A_WORD)
      .filter((word) => word !== "");
    const name = words.join(SEPARATOR).slice(0, this.maxLength);
    return name.endsWith(SEPARATOR) ? name.slice(0, -1) : name;
  }
}

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
