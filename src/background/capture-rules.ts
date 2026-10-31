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
const WEB_STORE =
  /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)(\/|$)/;

export class BrowserPageRule implements CaptureRule {
  readonly reason = "Chrome does not let extensions capture its own pages";

  blocks(url: string): Promise<boolean> {
    return Promise.resolve(BROWSER_PAGE.test(url));
  }
}

export class WebStoreRule implements CaptureRule {
  readonly reason = "Chrome does not let extensions capture the Web Store";

  blocks(url: string): Promise<boolean> {
    return Promise.resolve(WEB_STORE.test(url));
  }
}

export class LocalFileRule implements CaptureRule {
  readonly reason =
    "Turn on Allow access to file URLs for this extension to capture local files";

  constructor(private readonly files: FileSchemeAccess) {}

  async blocks(url: string): Promise<boolean> {
    return (
      url.startsWith("file:") && !(await this.files.isAllowedFileSchemeAccess())
    );
  }
}
