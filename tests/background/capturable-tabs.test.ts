import { CapturableTabs } from "../../src/background/capturable-tabs";

const tabs = (fileAccess = false) =>
  new CapturableTabs({
    isAllowedFileSchemeAccess: () => Promise.resolve(fileAccess),
  });

describe("CapturableTabs", () => {
  it("turns an ordinary web page into a capture target", async () => {
    await expect(
      tabs().targetFor({
        id: 4,
        windowId: 2,
        title: "Hello",
        url: "https://example.com/",
      }),
    ).resolves.toEqual({ tabId: 4, windowId: 2, title: "Hello" });
  });

  it.each([{ windowId: 2 }, { id: 4 }])(
    "refuses a tab without an id or window: %j",
    async (tab) => {
      await expect(tabs().targetFor(tab)).rejects.toThrow(
        "This tab cannot be captured",
      );
    },
  );

  it.each([
    "chrome://settings",
    "chrome-extension://abc/page.html",
    "about:blank",
    "view-source:https://example.com",
    "devtools://devtools/bundled/inspector.html",
    "edge://flags",
  ])("refuses Chrome's own page %s", async (url) => {
    await expect(tabs().targetFor({ id: 1, windowId: 1, url })).rejects.toThrow(
      "Chrome does not let extensions capture its own pages",
    );
  });

  it.each([
    "https://chromewebstore.google.com/detail/x",
    "https://chrome.google.com/webstore/category/extensions",
    "https://chromewebstore.google.com",
  ])("refuses the Web Store at %s", async (url) => {
    await expect(tabs().targetFor({ id: 1, windowId: 1, url })).rejects.toThrow(
      "Chrome does not let extensions capture the Web Store",
    );
  });

  it("allows a page that only looks like the Web Store", async () => {
    await expect(
      tabs().targetFor({
        id: 1,
        windowId: 1,
        url: "https://chrome.google.com/webstorefront",
      }),
    ).resolves.toMatchObject({ tabId: 1 });
  });

  it("asks for file access before capturing a local file", async () => {
    await expect(
      tabs(false).targetFor({ id: 1, windowId: 1, url: "file:///a.html" }),
    ).rejects.toThrow("Allow access to file URLs");
  });

  it("captures a local file when file access is on", async () => {
    await expect(
      tabs(true).targetFor({ id: 1, windowId: 1, url: "file:///a.html" }),
    ).resolves.toMatchObject({ tabId: 1 });
  });

  it("leaves a tab with no URL to the page script to judge", async () => {
    await expect(
      tabs().targetFor({ id: 1, windowId: 1 }),
    ).resolves.toMatchObject({ tabId: 1, title: undefined });
  });
});
