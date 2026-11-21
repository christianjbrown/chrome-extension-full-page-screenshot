import { REFUSALS } from "./refusals";

// One of Chrome's refusals, and what it means for the person who clicked.
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
