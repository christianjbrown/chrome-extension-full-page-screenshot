import type { ColourScheme } from "../shared/colour-scheme";

export interface SchemeReader {
  read(tabId: number): Promise<ColourScheme | undefined>;
}

export interface TabSchemeSink {
  tabShows(scheme: ColourScheme): Promise<void>;
}

// A click on the button lets the extension into that tab, which is the one
// chance to see the colour scheme Chrome itself is in.
export class ClickScheme {
  constructor(
    private readonly reader: SchemeReader,
    private readonly sink: TabSchemeSink,
  ) {}

  async clicked(tab: { id?: number | undefined }): Promise<void> {
    if (tab.id === undefined) {
      return;
    }
    const scheme = await this.reader.read(tab.id);
    if (scheme !== undefined) {
      await this.sink.tabShows(scheme);
    }
  }
}
