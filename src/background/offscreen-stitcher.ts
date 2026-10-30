import type { MessageSender, OffscreenMessage } from "../shared/messages";
import { unwrap } from "../shared/replies";

// The service worker's handle on the document that stitches the slices.
export interface StitchDriver {
  begin(width: number, height: number): Promise<void>;
  add(dataUrl: string, from: number, to: number, y: number): Promise<void>;
  finish(): Promise<string[]>;
  close(): Promise<void>;
}

export interface OffscreenDocuments {
  createDocument(parameters: {
    url: string;
    reasons: ["BLOBS"];
    justification: string;
  }): Promise<void>;
  closeDocument(): Promise<void>;
}

export interface ContextLookup {
  getContexts(filter: {
    contextTypes: ["OFFSCREEN_DOCUMENT"];
    documentUrls: [string];
  }): Promise<unknown[]>;
  getURL(path: string): string;
}

// The offscreen document lives from the first slice until the files are saved,
// because the blob URLs it hands out die with it.
export class OffscreenStitcher implements StitchDriver {
  constructor(
    private readonly documents: OffscreenDocuments,
    private readonly contexts: ContextLookup,
    private readonly messages: MessageSender<OffscreenMessage>,
    private readonly path: string,
  ) {}

  async begin(width: number, height: number): Promise<void> {
    if (!(await this.isOpen())) {
      await this.documents.createDocument({
        url: this.path,
        reasons: ["BLOBS"],
        justification: "Stitches the screenshot and hands it to downloads",
      });
    }
    await this.ask({ target: "offscreen", type: "begin", width, height });
  }

  add(dataUrl: string, from: number, to: number, y: number): Promise<void> {
    return this.ask({
      target: "offscreen",
      type: "slice",
      dataUrl,
      from,
      to,
      y,
    });
  }

  finish(): Promise<string[]> {
    return this.ask({ target: "offscreen", type: "finish" });
  }

  async close(): Promise<void> {
    if (await this.isOpen()) {
      await this.documents.closeDocument();
    }
  }

  private async isOpen(): Promise<boolean> {
    const contexts = await this.contexts.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [this.contexts.getURL(this.path)],
    });
    return contexts.length > 0;
  }

  private async ask<T>(message: OffscreenMessage): Promise<T> {
    return unwrap(await this.messages.send(message), "The stitcher") as T;
  }
}
