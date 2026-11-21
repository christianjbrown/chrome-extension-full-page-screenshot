import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import { isRect } from "../shared/message-fields";
import { isAddressed, type OffscreenMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import { SLICE, type SliceMessage } from "../shared/slice-message";
import { TARGETS } from "../shared/targets";
import type { SlicePainter } from "./stitch-commands";

const areRects = (value: unknown): boolean =>
  Array.isArray(value) && value.every(isRect);

// Where the capture was taken from, and which parts of it to paint.
const placed = (fields: Fields): boolean =>
  isFiniteNumber(fields.scroll) && areRects(fields.rects);

// The capture itself, and where it goes.
const carries = (fields: Fields): boolean =>
  typeof fields.dataUrl === "string" && placed(fields);

// Paints one capture into the picture.
export class SliceCommand implements Command<OffscreenMessage, typeof SLICE> {
  readonly type = SLICE;

  constructor(private readonly stitcher: SlicePainter) {}

  accepts(message: unknown): message is SliceMessage {
    return isAddressed(message, TARGETS.offscreen, SLICE) && carries(message);
  }

  handle(message: SliceMessage): Promise<void> {
    return this.stitcher.add(message.dataUrl, message.rects, message.scroll);
  }
}
