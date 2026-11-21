// Takes a picture of what the window's active tab shows.
export interface VisibleTabCapture {
  // The capture as a PNG data URL.
  capture(windowId: number): Promise<string>;
}
