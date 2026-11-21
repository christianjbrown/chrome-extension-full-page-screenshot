// Waits until Chrome has finished writing a download.
export interface DownloadWaiter {
  finished(id: number): Promise<void>;
}
