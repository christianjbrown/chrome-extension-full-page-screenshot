import type { Command, MessageOf } from "../shared/command";
import type { Fields } from "../shared/fields";
import { OFFSCREEN_TYPES, type OffscreenMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import type { StitchStarter } from "./stitch-commands";

type Begin = typeof OFFSCREEN_TYPES.begin;
type BeginMessage = MessageOf<OffscreenMessage, Begin>;

// Starts a new picture of the page's size.
export class BeginCommand implements Command<OffscreenMessage, Begin> {
  readonly type = OFFSCREEN_TYPES.begin;

  constructor(private readonly stitcher: StitchStarter) {}

  accepts(message: unknown): message is BeginMessage {
    const fields = message as Fields;
    return isFiniteNumber(fields.width) && isFiniteNumber(fields.height);
  }

  handle(message: BeginMessage): Promise<void> {
    return this.stitcher.begin(message.width, message.height);
  }
}
