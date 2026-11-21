import type { Command, MessageOf } from "../shared/command";
import type { Fields } from "../shared/fields";
import { isRect } from "../shared/message-fields";
import { OFFSCREEN_TYPES, type OffscreenMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import type { SlicePainter } from "./stitch-commands";

type Slice = typeof OFFSCREEN_TYPES.slice;
type SliceMessage = MessageOf<OffscreenMessage, Slice>;

// Paints one capture into the picture.
export class SliceCommand implements Command<OffscreenMessage, Slice> {
  readonly type = OFFSCREEN_TYPES.slice;

  constructor(private readonly stitcher: SlicePainter) {}

  accepts(message: unknown): message is SliceMessage {
    const fields = message as Fields;
    return (
      typeof fields.dataUrl === "string" &&
      isFiniteNumber(fields.scroll) &&
      Array.isArray(fields.rects) &&
      fields.rects.every(isRect)
    );
  }

  handle(message: SliceMessage): Promise<void> {
    return this.stitcher.add(message.dataUrl, message.rects, message.scroll);
  }
}
