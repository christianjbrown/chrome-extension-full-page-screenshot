import type { CaptureRule } from "./capture-rule";
import type {
  BrowserTab,
  CaptureTarget,
  CaptureTargets,
} from "./capture-target";

const NO_TAB = "This tab cannot be captured";
// A tab Chrome gives no address for is checked as if it had none.
const NO_URL = "";

// A tab Chrome has given both ids, which a capture needs.
type IdentifiedTab = BrowserTab & { id: number; windowId: number };

const isIdentified = (tab: BrowserTab): tab is IdentifiedTab =>
  tab.id !== undefined && tab.windowId !== undefined;

const urlOf = (tab: BrowserTab): string => tab.url ?? NO_URL;

// Turns the clicked tab into something to capture, or says plainly why Chrome
// will not allow it, before anything is injected.
export class CapturableTabs implements CaptureTargets {
  constructor(private readonly rules: CaptureRule[]) {}

  async targetFor(tab: BrowserTab): Promise<CaptureTarget> {
    if (!isIdentified(tab)) {
      throw new Error(NO_TAB);
    }
    await this.check(urlOf(tab));
    return { tabId: tab.id, windowId: tab.windowId, title: tab.title };
  }

  // The rules are asked in order, and the first that blocks gives the reason.
  private async check(url: string): Promise<void> {
    for (const rule of this.rules) {
      await this.checkOne(rule, url);
    }
  }

  private async checkOne(rule: CaptureRule, url: string): Promise<void> {
    if (await rule.blocks(url)) {
      throw new Error(rule.reason);
    }
  }
}
