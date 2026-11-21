import { REFUSALS } from "./refusals";

// One reason Chrome will not let an extension capture a tab.
export interface CaptureRule {
  blocks(url: string): Promise<boolean>;
  readonly reason: string;
}

export interface FileSchemeAccess {
  isAllowedFileSchemeAccess(): Promise<boolean>;
}

const BROWSER_PAGE =
  /^(chrome|chrome-extension|chrome-search|chrome-untrusted|devtools|edge|about|view-source):/;
const FILE_URL = "file:";
const WEB_STORE =
  /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)(\/|$)/;

export class BrowserPageRule implements CaptureRule {
  readonly reason = REFUSALS.ownPages;

  blocks(url: string): Promise<boolean> {
    return Promise.resolve(BROWSER_PAGE.test(url));
  }
}

export class WebStoreRule implements CaptureRule {
  readonly reason = REFUSALS.webStore;

  blocks(url: string): Promise<boolean> {
    return Promise.resolve(WEB_STORE.test(url));
  }
}

export class LocalFileRule implements CaptureRule {
  readonly reason = REFUSALS.localFiles;

  constructor(private readonly files: FileSchemeAccess) {}

  async blocks(url: string): Promise<boolean> {
    return (
      url.startsWith(FILE_URL) &&
      !(await this.files.isAllowedFileSchemeAccess())
    );
  }
}
