// Chrome's refusals as it words them, each with what it means for the person
// who clicked. A new one is a new class here and one line in the root.
import { REFUSALS } from "./refusals";
import type { Translation } from "./translation";

// Without the tabs permission Chrome hides its own pages' URLs from the
// extension, so these only come to light when the injection is refused.
const OWN_PAGES = [
  /^Cannot access a [a-z-]+:\/\/ URL/,
  /^Cannot access contents of url "chrome/,
] as const;
const WEB_STORE = "extensions gallery cannot be scripted";
const LOCAL_FILE = 'Cannot access contents of url "file:';
const LEFT_TAB = "'activeTab' permission is required";

export class OwnPageRefusal implements Translation {
  readonly message = REFUSALS.ownPages;

  explains(error: string): boolean {
    return OWN_PAGES.some((pattern) => pattern.test(error));
  }
}

export class WebStoreRefusal implements Translation {
  readonly message = REFUSALS.webStore;

  explains(error: string): boolean {
    return error.includes(WEB_STORE);
  }
}

export class LocalFileRefusal implements Translation {
  readonly message = REFUSALS.localFiles;

  explains(error: string): boolean {
    return error.startsWith(LOCAL_FILE);
  }
}

// The person moved to another tab, which took the extension's access with it.
export class LeftTabRefusal implements Translation {
  readonly message = REFUSALS.leftTab;

  explains(error: string): boolean {
    return error.includes(LEFT_TAB);
  }
}
