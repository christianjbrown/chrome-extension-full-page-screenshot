import { CONFLICT_ACTION } from "./conflict-action";
import type { Listening } from "./filename-listening";

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

// The one answer Chrome reads as no opinion about a download's name. Chromium's
// DeterminerCallback in downloads_api.cc skips an answer only when the filename
// is empty and the conflict action is uniquify. Calling suggest() with nothing,
// or not calling it, reaches that check with no conflict action, so Chrome takes
// it as a real suggestion of "" that clashes with other extensions' names.
const NO_OPINION: FilenameSuggestion = {
  filename: "",
  conflictAction: CONFLICT_ACTION,
};

// A claim holds the onDeterminingFilename listener open until Chrome has asked
// for that download's name, or the download is released without one. Its own
// download gets the claimed name suggested again: an extension that echoes
// Chrome's guess, answers late or answers empty can otherwise drop the filename
// passed to downloads.download(), and a blob URL then saves under its random ID.
// Anyone else's download that arrives while the listener is open gets the
// explicit no-opinion answer, and at once, because Chrome holds each download
// until every listener has answered.
export class ClaimedFilenames implements FilenameClaims, FilenameDeterminer {
  private readonly names = new Map<string, string>();

  constructor(private readonly listening: Listening) {}

  claim(url: string, filename: string): void {
    if (!this.names.has(url)) {
      this.listening.hold();
    }
    this.names.set(url, filename);
  }

  release(url: string): void {
    if (this.names.delete(url)) {
      this.listening.release();
    }
  }

  determine(item: DeterminedItem, suggest: Suggest): void {
    const filename = this.names.get(item.url);
    if (filename === undefined) {
      suggest(NO_OPINION);
      return;
    }
    suggest({ filename, conflictAction: CONFLICT_ACTION });
    this.release(item.url);
  }
}
