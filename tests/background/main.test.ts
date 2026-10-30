// Drives the service worker's wiring through a fake chrome, end to end.
import { strictNative } from "../shared/strict-native";

type Listener = (...args: unknown[]) => unknown;

interface FakeEvent {
  listeners: Listener[];
  addListener(listener: Listener): void;
  removeListener(listener: Listener): void;
  fire(...args: unknown[]): void;
}

function fakeEvent(): FakeEvent {
  const listeners: Listener[] = [];
  return {
    listeners,
    addListener: (listener) => {
      listeners.push(listener);
    },
    removeListener: (listener) => {
      listeners.splice(listeners.indexOf(listener), 1);
    },
    fire: (...args) => {
      listeners.forEach((listener) => {
        listener(...args);
      });
    },
  };
}

const layout = {
  viewportWidth: 1200,
  viewportHeight: 800,
  frameTop: 0,
  frameHeight: 800,
  frameLeft: 0,
  frameWidth: 1200,
  scrollHeight: 1200,
};

function pageReply(message: { type: string; y?: number }) {
  const values: Record<string, unknown> = {
    prepare: layout,
    scroll: message.y,
    restore: undefined,
  };
  return Promise.resolve({ ok: true, value: values[message.type] });
}

function offscreenReply(message: { type: string }) {
  return Promise.resolve({
    ok: true,
    value: message.type === "finish" ? ["blob:shot"] : undefined,
  });
}

function fakeChrome() {
  let open = false;
  const downloads = {
    download: vi.fn().mockResolvedValue(3),
    onChanged: fakeEvent(),
  };
  downloads.download.mockImplementation(() => {
    setTimeout(() => {
      downloads.onChanged.fire({ id: 3, state: { current: "complete" } });
    });
    return Promise.resolve(3);
  });
  return {
    action: {
      onClicked: fakeEvent(),
      setBadgeText: vi.fn().mockResolvedValue(undefined),
      setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
      setTitle: vi.fn().mockResolvedValue(undefined),
    },
    extension: {
      isAllowedFileSchemeAccess: vi.fn().mockResolvedValue(false),
    },
    scripting: { executeScript: vi.fn().mockResolvedValue([]) },
    tabs: {
      sendMessage: vi.fn((_tabId: number, message: { type: string }) =>
        pageReply(message),
      ),
      captureVisibleTab: vi.fn().mockResolvedValue("data:image/png;base64,AA"),
    },
    offscreen: {
      createDocument: vi.fn(() => {
        open = true;
        return Promise.resolve();
      }),
      closeDocument: vi.fn(() => {
        open = false;
        return Promise.resolve();
      }),
    },
    runtime: {
      getURL: (path: string) => `chrome-extension://id/${path}`,
      getContexts: vi.fn(() => Promise.resolve(open ? [{}] : [])),
      sendMessage: vi.fn((message: { type: string }) =>
        offscreenReply(message),
      ),
    },
    downloads,
  };
}

async function load() {
  vi.resetModules();
  const chrome = fakeChrome();
  vi.stubGlobal("chrome", chrome);
  const realSetTimeout = setTimeout;
  vi.stubGlobal(
    "setTimeout",
    strictNative((callback: () => void, ms?: number) =>
      realSetTimeout(callback, ms),
    ),
  );
  await import("../../src/background/main");
  return chrome;
}

describe("service worker", () => {
  it("captures the clicked tab and saves the PNG to the downloads folder", async () => {
    const chrome = await load();

    chrome.action.onClicked.fire({
      id: 4,
      windowId: 2,
      title: "Demo Page",
      url: "https://example.com/",
    });

    await vi.waitFor(
      () => {
        expect(chrome.offscreen.closeDocument).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 4 },
      files: ["page.js"],
    });
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledTimes(2);
    expect(chrome.tabs.captureVisibleTab).toHaveBeenCalledWith(2, {
      format: "png",
    });
    expect(chrome.offscreen.createDocument).toHaveBeenCalledWith(
      expect.objectContaining({ url: "offscreen.html", reasons: ["BLOBS"] }),
    );
    const filename: unknown = expect.stringMatching(
      /^\d{4}-\d\d-\d\d-\d\d-\d\d-demo-page\.png$/,
    );
    expect(chrome.downloads.download).toHaveBeenCalledWith({
      url: "blob:shot",
      filename,
      saveAs: false,
      conflictAction: "uniquify",
    });
    expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: "" });
  });

  it("explains Chrome refusing to inject into a page whose URL it hid", async () => {
    const chrome = await load();
    chrome.scripting.executeScript.mockRejectedValueOnce(
      new Error("Cannot access a chrome:// URL"),
    );

    chrome.action.onClicked.fire({ id: 4, windowId: 2 });

    await vi.waitFor(() => {
      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title:
          "Screenshot failed: Chrome does not let extensions capture its own pages",
      });
    });
  });

  it("shows an error badge on a page Chrome keeps to itself", async () => {
    const chrome = await load();

    chrome.action.onClicked.fire({
      id: 4,
      windowId: 2,
      url: "chrome://newtab/",
    });

    await vi.waitFor(() => {
      expect(chrome.action.setTitle).toHaveBeenCalledWith({
        title:
          "Screenshot failed: Chrome does not let extensions capture its own pages",
      });
    });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "!" });
    expect(chrome.scripting.executeScript).not.toHaveBeenCalled();
  });
});
