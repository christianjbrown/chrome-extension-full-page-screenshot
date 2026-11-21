import type { Command } from "../shared/command";
import { FINISH, type FinishMessage } from "../shared/finish-message";
import type { OffscreenMessage } from "../shared/messages";
import type { StitchFinisher } from "./stitch-commands";

// Writes out the picture and answers with its files.
export class FinishCommand implements Command<OffscreenMessage, typeof FINISH> {
  readonly type = FINISH;

  constructor(private readonly stitcher: StitchFinisher) {}

  // The message carries nothing beyond its type.
  accepts(_message: unknown): _message is FinishMessage {
    return true;
  }

  handle(): Promise<string[]> {
    return this.stitcher.finish();
  }
}
