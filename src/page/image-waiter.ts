// Waits for the images that have just scrolled into view, so a lazy-loaded
// image is captured drawn rather than blank. A slow image gets a little while
// and is then taken as it is, so one stuck download cannot stall the capture.
export interface ImageWaiter {
  // Whether there was anything to wait for.
  waitForVisible(): Promise<boolean>;
}
