import type { HiddenDocument, RenewableDocument } from "./hidden-document";

// Renews a document by closing it and opening it straight back up. Closing
// destroys everything the old one held, which is what a capture renews it for,
// and whatever else the page does carries on in the new one.
export class RenewingDocument implements RenewableDocument {
  constructor(private readonly inner: HiddenDocument) {}

  open(): Promise<void> {
    return this.inner.open();
  }

  async renew(): Promise<void> {
    try {
      await this.inner.close();
    } finally {
      await this.inner.open();
    }
  }
}
