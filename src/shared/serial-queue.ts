import type { Sequencer } from "./sequencer";

export class SerialQueue implements Sequencer {
  private last: Promise<unknown> = Promise.resolve();

  // Work that fails rejects for whoever asked for it, and the queue moves on.
  run<T>(work: () => Promise<T>): Promise<T> {
    const done = this.last.then(work);
    this.last = done.catch(() => undefined);
    return done;
  }
}
