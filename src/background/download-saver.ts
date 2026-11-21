import { CONFLICT_ACTION } from "./conflict-action";
import type { DownloadWaiter } from "./download-waiter";
import type { FileSaver } from "./file-saver";
import type { FilenameClaims } from "./filename-claims";

export interface Downloader {
  download(options: {
    url: string;
    filename: string;
    saveAs: false;
    conflictAction: typeof CONFLICT_ACTION;
  }): Promise<number>;
}

// Saves to Chrome's default downloads folder without asking where, and claims
// the name so that another extension cannot lose it.
export class DownloadSaver implements FileSaver {
  constructor(
    private readonly downloads: Downloader,
    private readonly claims: FilenameClaims,
    private readonly waiter: DownloadWaiter,
  ) {}

  // The file streams out of a blob URL that the offscreen document owns, so
  // that document has to stay open until Chrome has finished writing it.
  async save(url: string, filename: string): Promise<void> {
    this.claims.claim(url, filename);
    try {
      const id = await this.downloads.download({
        url,
        filename,
        saveAs: false,
        conflictAction: CONFLICT_ACTION,
      });
      await this.waiter.finished(id);
    } finally {
      this.claims.release(url);
    }
  }
}
