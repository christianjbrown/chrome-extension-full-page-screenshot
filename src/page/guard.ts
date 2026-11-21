// Says whether a value from the page is what the script takes it for.
export interface Guard<T> {
  matches(value: unknown): value is T;
}
