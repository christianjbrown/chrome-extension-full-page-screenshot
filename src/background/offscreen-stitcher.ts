import { BEGIN } from "../shared/begin-message";
import { FINISH } from "../shared/finish-message";
import type { OffscreenMessage } from "../shared/messages";
import type { Rect } from "../shared/rect";
import { SLICE } from "../shared/slice-message";
import { TARGETS } from "../shared/targets";
import type { MessageSender } from "../shared/message-sender";
import type { RenewableDocument } from "./hidden-document";
import type { StitchLifecycle, StitchSession } from "./stitch-session";
import type { ReplyReader } from "../shared/replies";

// Who failed to answer, in an error.
const STITCHER = "The stitcher";

// The blob URLs the document hands out die with it, so it is renewed once the
// files are saved. A capture uses the document if it is already open.
export class OffscreenStitcher implements StitchSession, StitchLifecycle {
  constructor(
    private readonly document: RenewableDocument,
    private readonly messages: MessageSender<OffscreenMessage>,
    private readonly replies: ReplyReader,
  ) {}

  async begin(width: number, height: number): Promise<void> {
    await this.document.open();
    await this.ask({
      target: TARGETS.offscreen,
      type: BEGIN,
      width,
      height,
    });
  }

  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void> {
    return this.ask({
      target: TARGETS.offscreen,
      type: SLICE,
      dataUrl,
      rects,
      scroll,
    });
  }

  finish(): Promise<string[]> {
    return this.ask({
      target: TARGETS.offscreen,
      type: FINISH,
    });
  }

  close(): Promise<void> {
    return this.document.renew();
  }

  private async ask<T>(message: OffscreenMessage): Promise<T> {
    return this.replies.read(await this.messages.send(message), STITCHER) as T;
  }
}
