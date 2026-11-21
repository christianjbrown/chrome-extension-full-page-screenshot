import type { BrowserTab } from "./capture-target";
import type { ClickListener } from "./click-listener";

// Runs beside the capture, never part of it: a failure must not stop a
// screenshot, and nothing waits for it, so it is dropped.
export class QuietClick implements ClickListener {
  constructor(private readonly inner: ClickListener) {}

  async clicked(tab: Pick<BrowserTab, "id">): Promise<void> {
    try {
      await this.inner.clicked(tab);
    } catch {
      // Dropped on purpose, as above.
    }
  }
}
