// Runs pieces of asynchronous work strictly one after another.
export interface Sequencer {
  run<T>(work: () => Promise<T>): Promise<T>;
}
