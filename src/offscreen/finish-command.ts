import type { Command } from "../shared/command";
import { FINISH, type FinishMessage } from "../shared/finish-message";
import { isAddressed } from "../shared/addressing";
import type { OffscreenMessage } from "../shared/messages";
import { TARGETS } from "../shared/targets";
import type { StitchFinisher } from "./stitch-commands";

// Writes out the picture and answers with its files.
export class FinishCommand implements Command<OffscreenMessage, typeof FINISH> {
  readonly type = FINISH;

  constructor(private readonly stitcher: StitchFinisher) {}

  // The message carries nothing beyond its address and type.
  accepts(message: unknown): message is FinishMessage {
    return isAddressed(message, TARGETS.offscreen, FINISH);
  }

  handle(): Promise<string[]> {
    return this.stitcher.finish();
  }
}
