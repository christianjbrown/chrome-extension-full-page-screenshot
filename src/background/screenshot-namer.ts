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

function pad(number: number): string {
  return String(number).padStart(2, "0");
}

function kebab(text: string): string {
  const words = text
    .normalize("NFKD")
    // Latin accents only (é to e); other scripts' marks, like Japanese ペ, recombine.
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word !== "");
  const name = words.join("-").slice(0, 80);
  return name.endsWith("-") ? name.slice(0, -1) : name;
}

function stamp(date: Date): string {
  const day = `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${day}-${pad(date.getHours())}-${pad(date.getMinutes())}`;
}

// "2026-10-30-14-05-my-cool-page", in the laptop's own time zone, so
// screenshots sort by when they were taken.
export class TimestampedNamer implements ScreenshotNamer {
  constructor(private readonly clock: Clock) {}

  // One part is the plain name; a page cut into parts numbers each of them.
  name(title: string | undefined, urls: string[]): NamedFile[] {
    const name = `${stamp(this.clock.now())}-${kebab(title ?? "") || "screenshot"}`;
    return urls.map((url, index) => ({
      url,
      filename:
        urls.length === 1
          ? `${name}.png`
          : `${name}-part-${String(index + 1)}.png`,
    }));
  }
}
