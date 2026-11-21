import type { CONFLICT_ACTION } from "./conflict-action";

// One answer to Chrome's question of what to call a download.
export interface FilenameSuggestion {
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
export interface FilenameDeterminer {
  determine(item: DeterminedItem, suggest: Suggest): void;
}
