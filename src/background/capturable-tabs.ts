import type { CaptureRule } from "./capture-rule";
import type {
  BrowserTab,
  CaptureTarget,
  CaptureTargets,
} from "./capture-target";

const NO_TAB = "This tab cannot be captured";
// A tab Chrome gives no address for is checked as if it had none.
const NO_URL = "";

// Turns the clicked tab into something to capture, or says plainly why Chrome
// will not allow it, before anything is injected.
export class CapturableTabs implements CaptureTargets {
  constructor(private readonly rules: CaptureRule[]) {}

  async targetFor(tab: BrowserTab): Promise<CaptureTarget> {
    if (tab.id === undefined || tab.windowId === undefined) {
      throw new Error(NO_TAB);
    }
    const url = tab.url ?? NO_URL;
    for (const rule of this.rules) {
      if (await rule.blocks(url)) {
        throw new Error(rule.reason);
      }
    }
    return { tabId: tab.id, windowId: tab.windowId, title: tab.title };
  }
}
