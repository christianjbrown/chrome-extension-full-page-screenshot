interface Restorable {
  restore(): Promise<void>;
}

export interface Installed<L> {
  listener: L;
  controller: Restorable;
}

// Where an install is kept so the next injected copy can find it.
export interface InstallSlot<L> {
  get(): Installed<L> | undefined;
  set(installed: Installed<L>): void;
}

export interface ListenerRegistry<L> {
  add(listener: L): void;
  remove(listener: L): void;
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
      this.registry.remove(previous.listener);
      void previous.controller.restore();
    }
    this.registry.add(installed.listener);
    this.slot.set(installed);
  }
}
