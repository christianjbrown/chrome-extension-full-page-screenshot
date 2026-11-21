// Chrome's refusals as it words them. What each means for the person who
// clicked is passed in by the root. A new one is a new class here and one line
// in the root.
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
  constructor(readonly message: string) {}

  explains(error: string): boolean {
    return OWN_PAGES.some((pattern) => pattern.test(error));
  }
}

export class WebStoreRefusal implements Translation {
  constructor(readonly message: string) {}

  explains(error: string): boolean {
    return error.includes(WEB_STORE);
  }
}

export class LocalFileRefusal implements Translation {
  constructor(readonly message: string) {}

  explains(error: string): boolean {
    return error.startsWith(LOCAL_FILE);
  }
}

// The person moved to another tab, which took the extension's access with it.
export class LeftTabRefusal implements Translation {
  constructor(readonly message: string) {}

  explains(error: string): boolean {
    return error.includes(LEFT_TAB);
  }
}
