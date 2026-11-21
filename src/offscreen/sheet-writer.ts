import type { Sheet } from "./picture";
import type { Bitmap } from "./surfaces";

export interface SheetWriter {
  // Turns a painted sheet into a PNG blob URL and lets its canvas go. A sheet
  // nothing was painted on, or one already written, is left as it is.
  writeOut(sheet: Sheet<Bitmap>): Promise<void>;
}
