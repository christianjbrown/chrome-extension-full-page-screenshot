import { isMessageFor } from "./messages";

// Who sent a message, as far as Chrome says.
export interface Sender {
  id?: string | undefined;
}

// Decides which runtime messages a context looks at at all.
export interface MessageFilter {
  accepts(
    message: unknown,
    sender: Sender | undefined,
  ): message is { target: string; type: unknown };
}

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
