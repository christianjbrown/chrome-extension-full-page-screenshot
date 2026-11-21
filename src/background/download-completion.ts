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

const stateOf = (delta: DownloadDelta): string | undefined =>
  delta.state?.current;

// Chrome's reason, or a plain one when it gives none.
const orInterrupted = (reason: string | undefined): string =>
  reason ?? INTERRUPTED;

const reasonOf = (delta: DownloadDelta): string =>
  orInterrupted(delta.error?.current);

// Resolves when the download completes, and fails with Chrome's reason when it
// is interrupted.
export class DownloadCompletion implements DownloadWaiter {
  constructor(private readonly changes: DownloadChanges) {}

  finished(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const stop = (settle: () => void): void => {
        this.changes.removeListener(listener);
        settle();
      };
      const onComplete = (delta: DownloadDelta): void => {
        if (stateOf(delta) === DOWNLOAD_STATES.complete) {
          stop(resolve);
        }
      };
      const onInterrupted = (delta: DownloadDelta): void => {
        if (stateOf(delta) === DOWNLOAD_STATES.interrupted) {
          stop(() => {
            reject(new Error(reasonOf(delta)));
          });
        }
      };
      // Chrome reports every download's changes, so only this one's count.
      const listener: DeltaListener = (delta) => {
        if (delta.id === id) {
          onComplete(delta);
          onInterrupted(delta);
        }
      };
      this.changes.addListener(listener);
    });
  }
}
