// Something that can be opened and closed, and does not mind being asked twice.
export interface HiddenDocument {
  open(): Promise<void>;
  close(): Promise<void>;
}

// A document that can be swapped for a fresh one. Renewing destroys
// everything the old one held and leaves a new one open in its place.
export interface RenewableDocument {
  open(): Promise<void>;
  renew(): Promise<void>;
}
