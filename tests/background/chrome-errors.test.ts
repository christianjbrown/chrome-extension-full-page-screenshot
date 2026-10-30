import { ChromeErrorExplainer } from "../../src/background/chrome-errors";

const explain = (message: string) =>
  new ChromeErrorExplainer().explain(new Error(message));

describe("ChromeErrorExplainer", () => {
  it.each([
    [
      "Cannot access a chrome:// URL",
      "Chrome does not let extensions capture its own pages",
    ],
    [
      "Cannot access a chrome-extension:// URL of different extension",
      "Chrome does not let extensions capture its own pages",
    ],
    [
      'Cannot access contents of url "chrome-error://chromewebdata/".',
      "Chrome does not let extensions capture its own pages",
    ],
    [
      "The extensions gallery cannot be scripted.",
      "Chrome does not let extensions capture the Web Store",
    ],
    [
      'Cannot access contents of url "file:///Users/a/b.html". Extension manifest must request permission to access this host.',
      "Turn on Allow access to file URLs for this extension to capture local files",
    ],
    [
      "Either the '<all_urls>' or 'activeTab' permission is required.",
      "Stay on the tab until the screenshot is done",
    ],
  ])("explains %j", (raw, friendly) => {
    expect(explain(raw)).toBe(friendly);
  });

  it("passes anything else through as it is", () => {
    expect(explain("FILE_NO_SPACE")).toBe("FILE_NO_SPACE");
    expect(new ChromeErrorExplainer().explain("plain")).toBe("plain");
  });
});
