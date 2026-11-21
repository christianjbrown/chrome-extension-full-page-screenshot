import { isColourScheme, type SchemeState } from "./scheme-state";

export interface StorageArea {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

const STORAGE_KEY = "toolbarScheme";

// Keeps what is known about the toolbar's colour across service worker sleeps
// and Chrome restarts, so the button is right before anyone clicks it again.
export class SchemeStore {
  constructor(
    private readonly area: StorageArea,
    // What to start from when nothing usable was saved.
    private readonly unknown: SchemeState,
  ) {}

  async load(): Promise<SchemeState> {
    const stored = (await this.area.get(STORAGE_KEY))[STORAGE_KEY];
    if (typeof stored !== "object" || stored === null) {
      return this.unknown;
    }
    const { device, chrome } = stored as Record<string, unknown>;
    return {
      device: isColourScheme(device) ? device : this.unknown.device,
      chrome: isColourScheme(chrome) ? chrome : null,
    };
  }

  save(state: SchemeState): Promise<void> {
    return this.area.set({ [STORAGE_KEY]: state });
  }
}
