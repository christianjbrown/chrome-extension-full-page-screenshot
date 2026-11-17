import {
  isColourScheme,
  UNKNOWN_SCHEME,
  type SchemeState,
} from "./scheme-state";

export interface StorageArea {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

const STORAGE_KEY = "toolbarScheme";

// Keeps what is known about the toolbar's colour across service worker sleeps
// and Chrome restarts, so the button is right before anyone clicks it again.
export class SchemeStore {
  constructor(private readonly area: StorageArea) {}

  async load(): Promise<SchemeState> {
    const stored = (await this.area.get(STORAGE_KEY))[STORAGE_KEY];
    if (typeof stored !== "object" || stored === null) {
      return UNKNOWN_SCHEME;
    }
    const { device, chrome } = stored as Record<string, unknown>;
    return {
      device: isColourScheme(device) ? device : UNKNOWN_SCHEME.device,
      chrome: isColourScheme(chrome) ? chrome : null,
    };
  }

  save(state: SchemeState): Promise<void> {
    return this.area.set({ [STORAGE_KEY]: state });
  }
}
