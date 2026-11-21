import type { Guard } from "./guard";
import type { Installed, InstallSlot } from "./reinstaller";

// Keeps an install on the page's global object, where every injected copy of
// the script can find it. What is found there is checked before it is trusted.
export class GlobalSlot<L> implements InstallSlot<L> {
  constructor(
    private readonly globals: Record<string, unknown>,
    private readonly key: string,
    private readonly guard: Guard<Installed<L>>,
  ) {}

  get(): Installed<L> | undefined {
    const found = this.globals[this.key];
    return this.guard.matches(found) ? found : undefined;
  }

  set(installed: Installed<L>): void {
    this.globals[this.key] = installed;
  }
}
