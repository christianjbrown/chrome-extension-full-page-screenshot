// A second file with the same name gets " (1)" added rather than replacing the first.
export const CONFLICT_ACTION = "uniquify";

interface FilenameSuggestion {
  filename: string;
  conflictAction: typeof CONFLICT_ACTION;
}

export type Suggest = (suggestion?: FilenameSuggestion) => void;

export interface DeterminedItem {
  url: string;
}

// Remembers which name each of this extension's downloads should be saved as.
export interface FilenameClaims {
  claim(url: string, filename: string): void;
  release(url: string): void;
}

// Answers Chrome's onDeterminingFilename event for one download.
interface FilenameDeterminer {
  determine(item: DeterminedItem, suggest: Suggest): void;
}

// Chrome drops the filename passed to downloads.download() once another
// extension listens to onDeterminingFilename and echoes Chrome's own guess, or
// answers late: a blob URL then saves under its random ID. Suggesting the name
// again from this event puts it back. Every other download is waved through
// untouched, and at once, because Chrome holds each one until all listeners
// have answered.
export class ClaimedFilenames implements FilenameClaims, FilenameDeterminer {
  private readonly names = new Map<string, string>();

  claim(url: string, filename: string): void {
    this.names.set(url, filename);
  }

  release(url: string): void {
    this.names.delete(url);
  }

  determine(item: DeterminedItem, suggest: Suggest): void {
    const filename = this.names.get(item.url);
    if (filename === undefined) {
      suggest();
      return;
    }
    suggest({ filename, conflictAction: CONFLICT_ACTION });
  }
}
