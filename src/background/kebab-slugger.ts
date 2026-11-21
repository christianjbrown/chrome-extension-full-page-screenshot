import { SEPARATOR, type TitleSlugger } from "./file-name-parts";

// Splits accents off their letters, then joins what is left back up.
const DECOMPOSED = "NFKD";
const COMPOSED = "NFC";
// Latin accents only (é to e); other scripts' marks, like Japanese ペ, recombine.
const LATIN_ACCENTS = /[\u0300-\u036f]/g;
const NOT_A_WORD = /[^\p{L}\p{N}]+/u;

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
