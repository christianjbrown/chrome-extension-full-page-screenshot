export interface BrowserTab {
  id?: number | undefined;
  windowId?: number | undefined;
  title?: string | undefined;
  url?: string | undefined;
}

export interface CaptureTarget {
  tabId: number;
  windowId: number;
  title: string | undefined;
}

export interface CaptureTargets {
  targetFor(tab: BrowserTab): Promise<CaptureTarget>;
}

export interface FileSchemeAccess {
  isAllowedFileSchemeAccess(): Promise<boolean>;
}

interface Rule {
  blocks(url: string): Promise<boolean>;
  reason: string;
}

const BROWSER_PAGE =
  /^(chrome|chrome-extension|chrome-search|chrome-untrusted|devtools|edge|about|view-source):/;
const WEB_STORE =
  /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)(\/|$)/;

// Turns the clicked tab into something to capture, or says plainly why Chrome
// will not allow it, before anything is injected.
export class CapturableTabs implements CaptureTargets {
  private readonly rules: Rule[];

  constructor(files: FileSchemeAccess) {
    this.rules = [
      {
        blocks: (url) => Promise.resolve(BROWSER_PAGE.test(url)),
        reason: "Chrome does not let extensions capture its own pages",
      },
      {
        blocks: (url) => Promise.resolve(WEB_STORE.test(url)),
        reason: "Chrome does not let extensions capture the Web Store",
      },
      {
        blocks: async (url) =>
          url.startsWith("file:") && !(await files.isAllowedFileSchemeAccess()),
        reason:
          "Turn on Allow access to file URLs for this extension to capture local files",
      },
    ];
  }

  async targetFor(tab: BrowserTab): Promise<CaptureTarget> {
    if (tab.id === undefined || tab.windowId === undefined) {
      throw new Error("This tab cannot be captured");
    }
    const url = tab.url ?? "";
    for (const rule of this.rules) {
      if (await rule.blocks(url)) {
        throw new Error(rule.reason);
      }
    }
    return { tabId: tab.id, windowId: tab.windowId, title: tab.title };
  }
}
