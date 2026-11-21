import type { ObjectUrls } from "./object-urls";
import type { SheetPaint } from "./sheet";
import type { SheetWriter } from "./sheet-writer";

export class PngSheetWriter implements SheetWriter {
  constructor(private readonly urls: ObjectUrls) {}

  async writeOut(paint: SheetPaint): Promise<void> {
    if (paint.surface !== undefined) {
      paint.url = this.urls.create(await paint.surface.toPng());
      delete paint.surface;
    }
  }
}
