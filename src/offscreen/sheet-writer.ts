import type { ObjectUrls } from "./blob-urls";
import type { Sheet } from "./picture";

export interface SheetWriter {
  // Turns a painted sheet into a PNG blob URL and lets its canvas go. A sheet
  // nothing was painted on, or one already written, is left as it is.
  writeOut(sheet: Sheet): Promise<void>;
}

export class PngSheetWriter implements SheetWriter {
  constructor(private readonly urls: ObjectUrls) {}

  async writeOut(sheet: Sheet): Promise<void> {
    if (sheet.surface !== undefined) {
      sheet.url = this.urls.create(await sheet.surface.toPng());
      delete sheet.surface;
    }
  }
}
