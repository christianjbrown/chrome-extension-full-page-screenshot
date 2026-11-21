// Waits for a while.
export interface Sleeper {
  sleep(ms: number): Promise<void>;
}
