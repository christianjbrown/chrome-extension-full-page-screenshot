// Settings for the service worker. Only its entry point reads them, and hands
// each one to the part that needs it.
export interface BackgroundConfig {
  // Past this, in CSS pixels, the capture stops. It keeps a page that never
  // ends from capturing for minutes.
  maxPageHeight: number;
  // A scroller shorter than this is not a pane worth stepping through, so the
  // whole viewport is stepped instead.
  minFrameHeight: number;
  // More slices than this would take hours, so the capture is refused.
  maxSlices: number;
  // Chrome allows two captureVisibleTab calls a second and fails the third, so
  // captures are spaced out a little wider than that.
  captureSpacingMs: number;
  // A page title longer than this is cut, so the file name stays manageable.
  maxTitleLength: number;
}

export const BACKGROUND_CONFIG: BackgroundConfig = {
  maxPageHeight: 60000,
  minFrameHeight: 100,
  maxSlices: 1000,
  captureSpacingMs: 600,
  maxTitleLength: 80,
};
