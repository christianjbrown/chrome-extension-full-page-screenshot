import type { Command } from "../shared/command";
import type { PageMessage } from "../shared/messages";
import { RESTORE, type RestoreMessage } from "../shared/restore-message";
import type { Restorable } from "./restorable";

// Puts the page back how the capture found it.
export class RestoreCommand implements Command<PageMessage, typeof RESTORE> {
  readonly type = RESTORE;

  constructor(private readonly page: Restorable) {}

  // The message carries nothing beyond its type.
  accepts(_message: unknown): _message is RestoreMessage {
    return true;
  }

  handle(): Promise<void> {
    return this.page.restore();
  }
}
