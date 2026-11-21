import type { ColourScheme } from "../shared/colour-scheme";
import type {
  SchemeIcon,
  SchemeMemory,
  SchemePolicy,
  SchemeState,
  TabSchemeSink,
} from "./scheme-ports";

// Works out which colour scheme the toolbar is in from the two things that
// report one, and keeps the button's icon in step.
export class ToolbarScheme implements TabSchemeSink {
  private last: Promise<void> = Promise.resolve();

  constructor(
    private readonly memory: SchemeMemory,
    private readonly icon: SchemeIcon,
    private readonly policy: SchemePolicy,
  ) {}

  // The offscreen document saw the device's scheme.
  deviceIs(scheme: ColourScheme): Promise<void> {
    return this.update((state) => this.policy.afterDevice(state, scheme));
  }

  // A page in a tab showed the scheme Chrome itself is in.
  tabShows(scheme: ColourScheme): Promise<void> {
    return this.update((state) => this.policy.afterTab(state, scheme));
  }

  // One at a time, so a report cannot save over one that arrived beside it.
  private update(change: (state: SchemeState) => SchemeState): Promise<void> {
    const turn = this.last.then(async () => {
      const next = change(await this.memory.load());
      await this.memory.save(next);
      await this.icon.show(this.policy.toolbarScheme(next));
    });
    this.last = turn.catch(() => undefined);
    return turn;
  }
}
