// Puts the page back how it was before a capture.
export interface Restorable {
  restore(): Promise<void>;
}
