import { BEGIN } from "../shared/begin-message";
import { FINISH } from "../shared/finish-message";
import type { OffscreenMessage } from "../shared/messages";
import type { Rect } from "../shared/rect";
import { SLICE } from "../shared/slice-message";
import { TARGETS } from "../shared/targets";
import type { MessageSender } from "../shared/message-sender";
import { isStringList } from "./guards";
import type { RenewableDocument } from "./hidden-document";
import type { StitchLifecycle, StitchSession } from "./stitch-session";
import type { ReplyReader } from "../shared/replies";

// Who failed to answer, in an error.
const STITCHER = "The stitcher";
const BAD_FILES = "The stitcher reported unusable files";

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
    await this.send({
      target: TARGETS.offscreen,
      type: BEGIN,
      width,
      height,
    });
  }

  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void> {
    return this.send({
      target: TARGETS.offscreen,
      type: SLICE,
      dataUrl,
      rects,
      scroll,
    });
  }

  // Blob URLs, which are all the rest of the capture can use.
  async finish(): Promise<string[]> {
    const files = await this.ask({ target: TARGETS.offscreen, type: FINISH });
    if (!isStringList(files)) {
      throw new Error(BAD_FILES);
    }
    return files;
  }

  close(): Promise<void> {
    return this.document.renew();
  }

  // For a message whose answer carries nothing.
  private async send(message: OffscreenMessage): Promise<void> {
    await this.ask(message);
  }

  private async ask(message: OffscreenMessage): Promise<unknown> {
    return this.replies.read(await this.messages.send(message), STITCHER);
  }
}
