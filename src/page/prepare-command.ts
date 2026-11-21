import type { Command } from "../shared/command";
import type { PageMessage } from "../shared/messages";
import type { PageLayout } from "../shared/page-layout";
import { PREPARE, type PrepareMessage } from "../shared/prepare-message";
import type { PagePreparer } from "./page-commands";

// Readies the page for a capture and answers with its layout.
export class PrepareCommand implements Command<PageMessage, typeof PREPARE> {
  readonly type = PREPARE;

  constructor(private readonly page: PagePreparer) {}

  // The message carries nothing beyond its type.
  accepts(_message: unknown): _message is PrepareMessage {
    return true;
  }

  handle(): Promise<PageLayout> {
    return this.page.prepare();
  }
}
