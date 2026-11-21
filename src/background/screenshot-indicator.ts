// Shows how far down the page a capture has got.
export interface ProgressIndicator {
  // From 0 to 1.
  showProgress(fraction: number): Promise<void>;
}

// Shows every stage of a screenshot, from the click to the saved file.
export interface ScreenshotIndicator extends ProgressIndicator {
  showIdle(): Promise<void>;
  showSaving(): Promise<void>;
  showError(message: string): Promise<void>;
}
