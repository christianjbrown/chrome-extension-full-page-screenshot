import type { HiddenDocument } from "./hidden-document";

const OFFSCREEN_REASONS = ["BLOBS", "MATCH_MEDIA"] as const;
const OFFSCREEN_DOCUMENT = "OFFSCREEN_DOCUMENT";
export const OFFSCREEN_JUSTIFICATION =
  "Stitches the screenshot and hands it to downloads, and reads the colour scheme so the toolbar icon matches it";

export interface OffscreenDocuments {
  createDocument(parameters: {
    url: string;
    reasons: (typeof OFFSCREEN_REASONS)[number][];
    justification: string;
  }): Promise<void>;
  closeDocument(): Promise<void>;
}

export interface ContextLookup {
  getContexts(filter: {
    contextTypes: [typeof OFFSCREEN_DOCUMENT];
    documentUrls: [string];
  }): Promise<unknown[]>;
  getURL(path: string): string;
}

// The extension's one offscreen document, and the only thing that creates it.
// Chrome allows a single offscreen document, and this one does two jobs: it
// stitches screenshots and it watches the colour scheme.
//
// Several events can wake the service worker at once, and a capture can end
// while another begins, so every open and close waits its turn and looks at
// what Chrome has open when that turn comes.
export class OffscreenPage implements HiddenDocument {
  private last: Promise<void> = Promise.resolve();

  constructor(
    private readonly documents: OffscreenDocuments,
    private readonly contexts: ContextLookup,
    private readonly path: string,
  ) {}

  open(): Promise<void> {
    return this.inTurn(async () => {
      if (!(await this.isOpen())) {
        await this.documents.createDocument({
          url: this.path,
          reasons: [...OFFSCREEN_REASONS],
          justification: OFFSCREEN_JUSTIFICATION,
        });
      }
    });
  }

  close(): Promise<void> {
    return this.inTurn(async () => {
      if (await this.isOpen()) {
        await this.documents.closeDocument();
      }
    });
  }

  // A turn that failed does not stop the ones queued behind it.
  private inTurn(work: () => Promise<void>): Promise<void> {
    const turn = this.last.then(work);
    this.last = turn.catch(() => undefined);
    return turn;
  }

  private async isOpen(): Promise<boolean> {
    const contexts = await this.contexts.getContexts({
      contextTypes: [OFFSCREEN_DOCUMENT],
      documentUrls: [this.contexts.getURL(this.path)],
    });
    return contexts.length > 0;
  }
}
