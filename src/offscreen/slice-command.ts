import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import { isRect } from "../shared/message-fields";
import type { OffscreenMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import { SLICE, type SliceMessage } from "../shared/slice-message";
import type { SlicePainter } from "./stitch-commands";

const areRects = (value: unknown): boolean =>
  Array.isArray(value) && value.every(isRect);

// Paints one capture into the picture.
export class SliceCommand implements Command<OffscreenMessage, typeof SLICE> {
  readonly type = SLICE;

  constructor(private readonly stitcher: SlicePainter) {}

  accepts(message: unknown): message is SliceMessage {
    const fields = message as Fields;
    return typeof fields.dataUrl === "string" && this.placed(fields);
  }

  // Where the capture was taken from, and which parts of it to paint.
  private placed(fields: Fields): boolean {
    return isFiniteNumber(fields.scroll) && areRects(fields.rects);
  }

  handle(message: SliceMessage): Promise<void> {
    return this.stitcher.add(message.dataUrl, message.rects, message.scroll);
  }
}
