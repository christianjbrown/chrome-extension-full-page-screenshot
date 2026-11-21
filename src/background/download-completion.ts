import type { DownloadWaiter } from "./download-waiter";

interface DownloadDelta {
  id: number;
  state?: { current?: string };
  error?: { current?: string };
}

type DeltaListener = (delta: DownloadDelta) => void;

export interface DownloadChanges {
  addListener(listener: DeltaListener): void;
  removeListener(listener: DeltaListener): void;
}

// The states of a download that mean Chrome has stopped writing it.
const DOWNLOAD_STATES = {
  complete: "complete",
  interrupted: "interrupted",
} as const;
const INTERRUPTED = "Download interrupted";

// Resolves when the download completes, and fails with Chrome's reason when it
// is interrupted.
export class DownloadCompletion implements DownloadWaiter {
  constructor(private readonly changes: DownloadChanges) {}

  finished(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const listener: DeltaListener = (delta) => {
        if (delta.id !== id) {
          return;
        }
        const state = delta.state?.current;
        if (state === DOWNLOAD_STATES.complete) {
          this.changes.removeListener(listener);
          resolve();
        }
        if (state === DOWNLOAD_STATES.interrupted) {
          this.changes.removeListener(listener);
          reject(new Error(delta.error?.current ?? INTERRUPTED));
        }
      };
      this.changes.addListener(listener);
    });
  }
}
