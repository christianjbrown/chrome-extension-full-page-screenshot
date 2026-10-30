import type { FileSaver } from "./file-saver";

interface DownloadDelta {
  id: number;
  state?: { current?: string };
  error?: { current?: string };
}

type DeltaListener = (delta: DownloadDelta) => void;

export interface DownloadsApi {
  download(options: {
    url: string;
    filename: string;
    saveAs: false;
    conflictAction: "uniquify";
  }): Promise<number>;
  onChanged: {
    addListener(listener: DeltaListener): void;
    removeListener(listener: DeltaListener): void;
  };
}

// Saves to Chrome's default downloads folder without asking where.
export class DownloadSaver implements FileSaver {
  constructor(private readonly downloads: DownloadsApi) {}

  async save(url: string, filename: string): Promise<void> {
    const id = await this.downloads.download({
      url,
      filename,
      saveAs: false,
      conflictAction: "uniquify",
    });
    await this.finished(id);
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
        if (state === "complete") {
          this.downloads.onChanged.removeListener(listener);
          resolve();
        }
        if (state === "interrupted") {
          this.downloads.onChanged.removeListener(listener);
          reject(new Error(delta.error?.current ?? "Download interrupted"));
        }
      };
      this.downloads.onChanged.addListener(listener);
    });
  }
}
