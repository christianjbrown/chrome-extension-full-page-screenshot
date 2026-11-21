import type { Command, MessageOf } from "../shared/command";
import { OFFSCREEN_TYPES, type OffscreenMessage } from "../shared/messages";
import type { StitchFinisher } from "./stitch-commands";

type Finish = typeof OFFSCREEN_TYPES.finish;
type FinishMessage = MessageOf<OffscreenMessage, Finish>;

// Writes out the picture and answers with its files.
export class FinishCommand implements Command<OffscreenMessage, Finish> {
  readonly type = OFFSCREEN_TYPES.finish;

  constructor(private readonly stitcher: StitchFinisher) {}

  // The message carries nothing beyond its type.
  accepts(_message: unknown): _message is FinishMessage {
    return true;
  }

  handle(): Promise<string[]> {
    return this.stitcher.finish();
  }
}
