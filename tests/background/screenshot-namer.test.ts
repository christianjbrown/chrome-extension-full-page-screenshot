import { TimestampedNamer } from "../../src/background/screenshot-namer";
import { SystemClock } from "../../src/background/system-clock";

const at = (date: Date) => new TimestampedNamer({ now: () => date });
const afternoon = new Date(2026, 9, 30, 14, 5, 12);
const one = (title: string | undefined, date = afternoon) =>
  at(date).name(title, ["blob:1"])[0]!.filename;

describe("TimestampedNamer", () => {
  it("starts with the local date and time, then the title in kebab-case", () => {
    expect(one("My Cool Page | YouTube")).toBe(
      "2026-10-30-14-05-my-cool-page-youtube.png",
    );
  });

  it("pads single digit months, days, hours and minutes", () => {
    expect(one("x", new Date(2026, 0, 2, 3, 4))).toBe("2026-01-02-03-04-x.png");
  });

  it("drops Latin accents", () => {
    expect(one("Café Müller: Ünïcode/Test?")).toBe(
      "2026-10-30-14-05-cafe-muller-unicode-test.png",
    );
  });

  it("keeps other scripts whole", () => {
    expect(one("日本語 ページ")).toBe("2026-10-30-14-05-日本語-ページ.png");
  });

  it.each([undefined, "", "  ", "!!!"])(
    "falls back to screenshot for %j",
    (title) => {
      expect(one(title)).toBe("2026-10-30-14-05-screenshot.png");
    },
  );

  it("keeps long titles to 80 characters", () => {
    expect(one("a".repeat(100))).toBe(`2026-10-30-14-05-${"a".repeat(80)}.png`);
  });

  it("does not end on a hyphen when the cut lands on one", () => {
    expect(one(`${"a".repeat(79)} bc`)).toBe(
      `2026-10-30-14-05-${"a".repeat(79)}.png`,
    );
  });

  it("numbers the parts of a page cut into several", () => {
    expect(at(afternoon).name("Long", ["blob:1", "blob:2"])).toEqual([
      { url: "blob:1", filename: "2026-10-30-14-05-long-part-1.png" },
      { url: "blob:2", filename: "2026-10-30-14-05-long-part-2.png" },
    ]);
  });
});

describe("SystemClock", () => {
  it("tells the current time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(afternoon);

    expect(new SystemClock().now()).toEqual(afternoon);

    vi.useRealTimers();
  });
});
