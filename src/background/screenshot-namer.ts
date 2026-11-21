import { PNG_EXTENSION } from "../shared/png";
import {
  SEPARATOR,
  type TimeStamper,
  type TitleSlugger,
} from "./file-name-parts";
import type { Clock } from "./system-clock";

export interface NamedFile {
  url: string;
  filename: string;
}

export interface ScreenshotNamer {
  // Gives each part of the screenshot, top to bottom, its filename.
  name(title: string | undefined, urls: string[]): NamedFile[];
}

// The name for a page with no usable title.
const UNTITLED = "screenshot";
const PART = "-part-";
// A page Chrome gives no title for is named as if it had none.
const NO_TITLE = "";

export interface TimestampedNamerDependencies {
  clock: Clock;
  slugger: TitleSlugger;
  stamper: TimeStamper;
}

// "2026-10-30-14-05-my-cool-page", so screenshots sort by when they were taken.
export class TimestampedNamer implements ScreenshotNamer {
  constructor(private readonly deps: TimestampedNamerDependencies) {}

  // One part is the plain name; a page cut into parts numbers each of them.
  name(title: string | undefined, urls: string[]): NamedFile[] {
    const { clock, slugger, stamper } = this.deps;
    const name = [
      stamper.stamp(clock.now()),
      slugger.slug(title ?? NO_TITLE) || UNTITLED,
    ].join(SEPARATOR);
    return urls.map((url, index) => ({
      url,
      filename:
        urls.length === 1
          ? `${name}${PNG_EXTENSION}`
          : `${name}${PART}${String(index + 1)}${PNG_EXTENSION}`,
    }));
  }
}
