export interface ScreenshotIndicator {
  showIdle(): Promise<void>;
  // How far down the page the capture has got, from 0 to 1.
  showProgress(fraction: number): Promise<void>;
  showSaving(): Promise<void>;
  showError(message: string): Promise<void>;
}
