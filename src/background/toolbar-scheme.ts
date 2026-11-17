import type { ColourScheme } from "../shared/colour-scheme";
import {
  afterDevice,
  afterTab,
  toolbarScheme,
  type SchemeState,
} from "./scheme-state";

export interface SchemeMemory {
  load(): Promise<SchemeState>;
  save(state: SchemeState): Promise<void>;
}

export interface SchemeIcon {
  show(scheme: ColourScheme): Promise<void>;
}

// Works out which colour scheme the toolbar is in from the two things that
// report one, and keeps the button's icon in step.
export class ToolbarScheme {
  private last: Promise<void> = Promise.resolve();

  constructor(
    private readonly memory: SchemeMemory,
    private readonly icon: SchemeIcon,
  ) {}

  // The offscreen document saw the device's scheme.
  deviceIs(scheme: ColourScheme): Promise<void> {
    return this.update((state) => afterDevice(state, scheme));
  }

  // A page in a tab showed the scheme Chrome itself is in.
  tabShows(scheme: ColourScheme): Promise<void> {
    return this.update((state) => afterTab(state, scheme));
  }

  // One at a time, so a report cannot save over one that arrived beside it.
  private update(change: (state: SchemeState) => SchemeState): Promise<void> {
    const turn = this.last.then(async () => {
      const next = change(await this.memory.load());
      await this.memory.save(next);
      await this.icon.show(toolbarScheme(next));
    });
    this.last = turn.catch(() => undefined);
    return turn;
  }
}
