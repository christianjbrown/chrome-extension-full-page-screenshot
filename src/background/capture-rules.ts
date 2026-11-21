// Pages Chrome will not let an extension capture. What the person who clicked
// is told about each is passed in by the root.
import type { CaptureRule } from "./capture-rule";

export interface FileSchemeAccess {
  isAllowedFileSchemeAccess(): Promise<boolean>;
}

const BROWSER_PAGE =
  /^(chrome|chrome-extension|chrome-search|chrome-untrusted|devtools|edge|about|view-source):/;
const FILE_URL = "file:";
const WEB_STORE =
  /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)(\/|$)/;

export class BrowserPageRule implements CaptureRule {
  constructor(readonly reason: string) {}

  blocks(url: string): Promise<boolean> {
    return Promise.resolve(BROWSER_PAGE.test(url));
  }
}

export class WebStoreRule implements CaptureRule {
  constructor(readonly reason: string) {}

  blocks(url: string): Promise<boolean> {
    return Promise.resolve(WEB_STORE.test(url));
  }
}

export class LocalFileRule implements CaptureRule {
  constructor(
    private readonly files: FileSchemeAccess,
    readonly reason: string,
  ) {}

  async blocks(url: string): Promise<boolean> {
    return (
      url.startsWith(FILE_URL) &&
      !(await this.files.isAllowedFileSchemeAccess())
    );
  }
}
