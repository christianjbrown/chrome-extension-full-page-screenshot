import { errorMessage } from "../shared/error-message";
import type { ErrorExplainer } from "./error-explainer";
import { REFUSALS } from "./refusals";

export interface Translation {
  pattern: RegExp;
  message: string;
}

export const TRANSLATIONS: readonly Translation[] = [
  // Without the tabs permission Chrome hides its own pages' URLs from the
  // extension, so these only come to light when the injection is refused.
  { pattern: /^Cannot access a [a-z-]+:\/\/ URL/, message: REFUSALS.ownPages },
  {
    pattern: /^Cannot access contents of url "chrome/,
    message: REFUSALS.ownPages,
  },
  {
    pattern: /extensions gallery cannot be scripted/,
    message: REFUSALS.webStore,
  },
  {
    pattern: /^Cannot access contents of url "file:/,
    message: REFUSALS.localFiles,
  },
  {
    pattern: /'activeTab' permission is required/,
    message: REFUSALS.leftTab,
  },
];

// Says what Chrome's terser refusals mean for the person who clicked.
export class ChromeErrorExplainer implements ErrorExplainer {
  constructor(private readonly translations: readonly Translation[]) {}

  explain(error: unknown): string {
    const message = errorMessage(error);
    return (
      this.translations.find(({ pattern }) => pattern.test(message))?.message ??
      message
    );
  }
}
