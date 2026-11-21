import { BEGIN, type BeginMessage } from "../shared/begin-message";
import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import type { OffscreenMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import type { StitchStarter } from "./stitch-commands";

// Starts a new picture of the page's size.
export class BeginCommand implements Command<OffscreenMessage, typeof BEGIN> {
  readonly type = BEGIN;

  constructor(private readonly stitcher: StitchStarter) {}

  accepts(message: unknown): message is BeginMessage {
    const fields = message as Fields;
    return isFiniteNumber(fields.width) && isFiniteNumber(fields.height);
  }

  handle(message: BeginMessage): Promise<void> {
    return this.stitcher.begin(message.width, message.height);
  }
}
