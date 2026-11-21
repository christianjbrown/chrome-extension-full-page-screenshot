// The tab that was clicked, as Chrome describes it.
export interface BrowserTab {
  id?: number | undefined;
  windowId?: number | undefined;
  title?: string | undefined;
  url?: string | undefined;
}

// A tab that can be captured, and the window it is in.
export interface CaptureTarget {
  tabId: number;
  windowId: number;
  title: string | undefined;
}

// Turns the clicked tab into something to capture, or says why it cannot be.
export interface CaptureTargets {
  targetFor(tab: BrowserTab): Promise<CaptureTarget>;
}
