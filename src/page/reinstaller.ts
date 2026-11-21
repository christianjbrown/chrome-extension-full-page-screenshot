import type { Restorable } from "./restorable";

export interface Installed<L> {
  listener: L;
  controller: Restorable;
}

// Where an install is kept so the next injected copy can find it.
export interface InstallSlot<L> {
  get(): Installed<L> | undefined;
  set(installed: Installed<L>): void;
}

// Named as Chrome's events name them, so one can be passed in as it is.
export interface ListenerRegistry<L> {
  addListener(listener: L): void;
  removeListener(listener: L): void;
}

// The script is injected again on every click, so each copy first retires the
// one a previous click left behind: its listener goes, and its page is put back.
export class Reinstaller<L> {
  constructor(
    private readonly slot: InstallSlot<L>,
    private readonly registry: ListenerRegistry<L>,
  ) {}

  install(installed: Installed<L>): void {
    const previous = this.slot.get();
    if (previous !== undefined) {
      this.registry.removeListener(previous.listener);
      void previous.controller.restore();
    }
    this.registry.addListener(installed.listener);
    this.slot.set(installed);
  }
}
