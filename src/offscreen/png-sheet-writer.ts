import type { ObjectUrls } from "./object-urls";
import type { Sheet } from "./picture";
import type { SheetWriter } from "./sheet-writer";
import type { Bitmap } from "./surfaces";

export class PngSheetWriter implements SheetWriter {
  constructor(private readonly urls: ObjectUrls) {}

  async writeOut(sheet: Sheet<Bitmap>): Promise<void> {
    if (sheet.surface !== undefined) {
      sheet.url = this.urls.create(await sheet.surface.toPng());
      delete sheet.surface;
    }
  }
}
