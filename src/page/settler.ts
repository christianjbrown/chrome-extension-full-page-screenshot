// Waits for the page to repaint after a scroll, and for scroll handlers and
// lazy images to catch up, before the slice is captured.
export interface Settler {
  settle(): Promise<void>;
}
