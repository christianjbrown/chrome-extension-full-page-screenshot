import type { MessageSender, OffscreenMessage, Rect } from "../shared/messages";
import type { HiddenDocument } from "./offscreen-page";
import { unwrap } from "../shared/replies";

// The service worker's handle on the document that stitches the slices.
export interface StitchSession {
  begin(width: number, height: number): Promise<void>;
  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void>;
  finish(): Promise<string[]>;
}

// Whoever starts a capture also ends it, whether or not it got as far as stitching.
export interface StitchLifecycle {
  close(): Promise<void>;
}

// The blob URLs the document hands out die with it, so it is closed once the
// files are saved. A capture uses the document if it is already open.
export class OffscreenStitcher implements StitchSession, StitchLifecycle {
  constructor(
    private readonly document: HiddenDocument,
    private readonly messages: MessageSender<OffscreenMessage>,
  ) {}

  async begin(width: number, height: number): Promise<void> {
    await this.document.open();
    await this.ask({ target: "offscreen", type: "begin", width, height });
  }

  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void> {
    return this.ask({
      target: "offscreen",
      type: "slice",
      dataUrl,
      rects,
      scroll,
    });
  }

  finish(): Promise<string[]> {
    return this.ask({ target: "offscreen", type: "finish" });
  }

  close(): Promise<void> {
    return this.document.close();
  }

  private async ask<T>(message: OffscreenMessage): Promise<T> {
    return unwrap(await this.messages.send(message), "The stitcher") as T;
  }
}
