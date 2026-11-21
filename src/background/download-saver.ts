import { CONFLICT_ACTION } from "./conflict-action";
import type { FilenameClaims } from "./filename-claims";
import type { FileSaver } from "./file-saver";

interface DownloadDelta {
  id: number;
  state?: { current?: string };
  error?: { current?: string };
}

// The states of a download that mean Chrome has stopped writing it.
const DOWNLOAD_STATES = {
  complete: "complete",
  interrupted: "interrupted",
} as const;
const INTERRUPTED = "Download interrupted";

type DeltaListener = (delta: DownloadDelta) => void;

export interface DownloadsApi {
  download(options: {
    url: string;
    filename: string;
    saveAs: false;
    conflictAction: typeof CONFLICT_ACTION;
  }): Promise<number>;
  onChanged: {
    addListener(listener: DeltaListener): void;
    removeListener(listener: DeltaListener): void;
  };
}

// Saves to Chrome's default downloads folder without asking where, and claims
// the name so that another extension cannot lose it.
export class DownloadSaver implements FileSaver {
  constructor(
    private readonly downloads: DownloadsApi,
    private readonly claims: FilenameClaims,
  ) {}

  async save(url: string, filename: string): Promise<void> {
    this.claims.claim(url, filename);
    try {
      const id = await this.downloads.download({
        url,
        filename,
        saveAs: false,
        conflictAction: CONFLICT_ACTION,
      });
      await this.finished(id);
    } finally {
      this.claims.release(url);
    }
  }

  // The file streams out of a blob URL that the offscreen document owns, so that
  // document has to stay open until Chrome has finished writing it.
  private finished(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const listener: DeltaListener = (delta) => {
        if (delta.id !== id) {
          return;
        }
        const state = delta.state?.current;
        if (state === DOWNLOAD_STATES.complete) {
          this.downloads.onChanged.removeListener(listener);
          resolve();
        }
        if (state === DOWNLOAD_STATES.interrupted) {
          this.downloads.onChanged.removeListener(listener);
          reject(new Error(delta.error?.current ?? INTERRUPTED));
        }
      };
      this.downloads.onChanged.addListener(listener);
    });
  }
}
