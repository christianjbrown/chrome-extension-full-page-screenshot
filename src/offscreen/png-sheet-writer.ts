import type { ObjectUrls } from "./object-urls";
import type { Sheet } from "./picture";
import type { SheetWriter } from "./sheet-writer";

export class PngSheetWriter implements SheetWriter {
  constructor(private readonly urls: ObjectUrls) {}

  async writeOut(sheet: Sheet): Promise<void> {
    if (sheet.surface !== undefined) {
      sheet.url = this.urls.create(await sheet.surface.toPng());
      delete sheet.surface;
    }
  }
}
