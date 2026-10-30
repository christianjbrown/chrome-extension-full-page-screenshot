import { errorMessage } from "../shared/error-message";

export interface ErrorExplainer {
  explain(error: unknown): string;
}

interface Translation {
  pattern: RegExp;
  message: string;
}

const OWN_PAGES = "Chrome does not let extensions capture its own pages";

const TRANSLATIONS: readonly Translation[] = [
  // Without the tabs permission Chrome hides its own pages' URLs from the
  // extension, so these only come to light when the injection is refused.
  { pattern: /^Cannot access a [a-z-]+:\/\/ URL/, message: OWN_PAGES },
  { pattern: /^Cannot access contents of url "chrome/, message: OWN_PAGES },
  {
    pattern: /extensions gallery cannot be scripted/,
    message: "Chrome does not let extensions capture the Web Store",
  },
  {
    pattern: /^Cannot access contents of url "file:/,
    message:
      "Turn on Allow access to file URLs for this extension to capture local files",
  },
  {
    pattern: /'activeTab' permission is required/,
    message: "Stay on the tab until the screenshot is done",
  },
];

// Says what Chrome's terser refusals mean for the person who clicked.
export class ChromeErrorExplainer implements ErrorExplainer {
  explain(error: unknown): string {
    const message = errorMessage(error);
    return (
      TRANSLATIONS.find(({ pattern }) => pattern.test(message))?.message ??
      message
    );
  }
}
