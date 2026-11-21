import type { BrowserTab } from "./capture-target";

// Hears that the toolbar button was clicked on a tab.
export interface ClickListener {
  clicked(tab: Pick<BrowserTab, "id">): Promise<void>;
}
