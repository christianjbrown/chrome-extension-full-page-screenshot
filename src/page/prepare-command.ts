import type { Command } from "../shared/command";
import { isAddressed } from "../shared/addressing";
import type { PageMessage } from "../shared/messages";
import type { PageLayout } from "../shared/page-layout";
import { PREPARE, type PrepareMessage } from "../shared/prepare-message";
import { TARGETS } from "../shared/targets";
import type { PagePreparer } from "./page-commands";

// Readies the page for a capture and answers with its layout.
export class PrepareCommand implements Command<PageMessage, typeof PREPARE> {
  readonly type = PREPARE;

  constructor(private readonly page: PagePreparer) {}

  // The message carries nothing beyond its address and type.
  accepts(message: unknown): message is PrepareMessage {
    return isAddressed(message, TARGETS.page, PREPARE);
  }

  handle(): Promise<PageLayout> {
    return this.page.prepare();
  }
}
