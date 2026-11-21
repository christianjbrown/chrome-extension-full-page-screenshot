import type { MessageFilter, Sender } from "./message-filter";
import { isMessageFor } from "./messages";

// Every runtime message reaches every context, so each takes only those meant
// for it, and only from the extension's own contexts.
export class OwnContextFilter implements MessageFilter {
  constructor(
    private readonly extensionId: string,
    private readonly target: string,
  ) {}

  accepts(
    message: unknown,
    sender: Sender | undefined,
  ): message is { target: string; type: unknown } {
    return (
      sender?.id === this.extensionId && isMessageFor(message, this.target)
    );
  }
}
