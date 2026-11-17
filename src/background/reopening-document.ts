import type { HiddenDocument } from "./offscreen-page";

// A document that comes straight back after it is closed. Closing still
// destroys everything the old one held, which is what a capture closes it for,
// and whatever else the page does carries on in the new one.
export class ReopeningDocument implements HiddenDocument {
  constructor(private readonly inner: HiddenDocument) {}

  open(): Promise<void> {
    return this.inner.open();
  }

  async close(): Promise<void> {
    try {
      await this.inner.close();
    } finally {
      await this.inner.open();
    }
  }
}
