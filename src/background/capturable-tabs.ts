import type { CaptureRule } from "./capture-rules";

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
