import type { Command } from "../shared/command";
import { isAddressed } from "../shared/addressing";
import type { PageMessage } from "../shared/messages";
import { RESTORE, type RestoreMessage } from "../shared/restore-message";
import { TARGETS } from "../shared/targets";
import type { Restorable } from "./restorable";

// Puts the page back how the capture found it.
export class RestoreCommand implements Command<PageMessage, typeof RESTORE> {
  readonly type = RESTORE;

  constructor(private readonly page: Restorable) {}

  // The message carries nothing beyond its address and type.
  accepts(message: unknown): message is RestoreMessage {
    return isAddressed(message, TARGETS.page, RESTORE);
  }

  handle(): Promise<void> {
    return this.page.restore();
  }
}
