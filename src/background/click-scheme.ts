import type { ColourScheme } from "../shared/colour-scheme";
import type { BrowserTab } from "./capture-target";
import type { ClickListener } from "./click-listener";
import type { SchemeReader, TabSchemeSink } from "./scheme-ports";

// A click on the button lets the extension into that tab, which is the one
// chance to see the colour scheme Chrome itself is in.
export class ClickScheme implements ClickListener {
  constructor(
    private readonly reader: SchemeReader,
    private readonly sink: TabSchemeSink,
  ) {}

  async clicked(tab: Pick<BrowserTab, "id">): Promise<void> {
    if (tab.id === undefined) {
      return;
    }
    await this.report(await this.reader.read(tab.id));
  }

  // A tab that could not be asked has nothing to report.
  private async report(scheme: ColourScheme | undefined): Promise<void> {
    if (scheme !== undefined) {
      await this.sink.tabShows(scheme);
    }
  }
}
