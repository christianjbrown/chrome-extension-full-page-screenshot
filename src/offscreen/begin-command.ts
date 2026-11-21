import { BEGIN, type BeginMessage } from "../shared/begin-message";
import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import { isAddressed } from "../shared/addressing";
import type { OffscreenMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import { TARGETS } from "../shared/targets";
import type { StitchStarter } from "./stitch-commands";

// The page's size.
const carries = (fields: Fields): boolean =>
  isFiniteNumber(fields.width) && isFiniteNumber(fields.height);

// Starts a new picture of the page's size.
export class BeginCommand implements Command<OffscreenMessage, typeof BEGIN> {
  readonly type = BEGIN;

  constructor(private readonly stitcher: StitchStarter) {}

  accepts(message: unknown): message is BeginMessage {
    return isAddressed(message, TARGETS.offscreen, BEGIN) && carries(message);
  }

  handle(message: BeginMessage): Promise<void> {
    return this.stitcher.begin(message.width, message.height);
  }
}
