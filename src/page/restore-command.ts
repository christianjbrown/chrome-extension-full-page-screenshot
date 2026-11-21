import type { Command, MessageOf } from "../shared/command";
import { PAGE_TYPES, type PageMessage } from "../shared/messages";
import type { Restorable } from "./restorable";

type Restore = typeof PAGE_TYPES.restore;
type RestoreMessage = MessageOf<PageMessage, Restore>;

// Puts the page back how the capture found it.
export class RestoreCommand implements Command<PageMessage, Restore> {
  readonly type = PAGE_TYPES.restore;

  constructor(private readonly page: Restorable) {}

  // The message carries nothing beyond its type.
  accepts(_message: unknown): _message is RestoreMessage {
    return true;
  }

  handle(): Promise<void> {
    return this.page.restore();
  }
}
