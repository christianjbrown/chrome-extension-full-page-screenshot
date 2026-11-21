// Keeps a listener registered for as long as anything is holding it.
export interface Listening {
  hold(): void;
  release(): void;
}
