import type { Command, MessageOf } from "../shared/command";
import {
  PAGE_TYPES,
  type PageLayout,
  type PageMessage,
} from "../shared/messages";
import type { PagePreparer } from "./page-commands";

type Prepare = typeof PAGE_TYPES.prepare;
type PrepareMessage = MessageOf<PageMessage, Prepare>;

// Readies the page for a capture and answers with its layout.
export class PrepareCommand implements Command<PageMessage, Prepare> {
  readonly type = PAGE_TYPES.prepare;

  constructor(private readonly page: PagePreparer) {}

  // The message carries nothing beyond its type.
  accepts(_message: unknown): _message is PrepareMessage {
    return true;
  }

  handle(): Promise<PageLayout> {
    return this.page.prepare();
  }
}
