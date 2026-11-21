import { isColourScheme, type ColourScheme } from "../shared/colour-scheme";
import { isFields, type Fields } from "../shared/fields";
import type { SchemeMemory, SchemeState } from "./scheme-ports";

export interface StorageArea {
  get(key: string): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

const STORAGE_KEY = "toolbarScheme";

// Chrome's own setting is only known once a tab has shown it.
const chromeOf = (chrome: unknown): ColourScheme | null =>
  isColourScheme(chrome) ? chrome : null;

// Keeps what is known about the toolbar's colour across service worker sleeps
// and Chrome restarts, so the button is right before anyone clicks it again.
export class SchemeStore implements SchemeMemory {
  constructor(
    private readonly area: StorageArea,
    // What to start from when nothing usable was saved.
    private readonly unknown: SchemeState,
  ) {}

  async load(): Promise<SchemeState> {
    const stored = (await this.area.get(STORAGE_KEY))[STORAGE_KEY];
    return isFields(stored) ? this.read(stored) : this.unknown;
  }

  private read({ device, chrome }: Fields): SchemeState {
    return { device: this.deviceOf(device), chrome: chromeOf(chrome) };
  }

  private deviceOf(device: unknown): ColourScheme {
    return isColourScheme(device) ? device : this.unknown.device;
  }

  save(state: SchemeState): Promise<void> {
    return this.area.set({ [STORAGE_KEY]: state });
  }
}
