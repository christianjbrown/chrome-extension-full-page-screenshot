import type { MessageGuards } from "./message-guards";
import { isMessageFor, type Reply } from "./messages";
import { replyWhenDone } from "./replies";

interface Message {
  target: string;
  type: string;
}

// Who sent a message, as far as Chrome says.
interface Sender {
  id?: string | undefined;
}

export type CommandHandlers<M extends Message> = {
  [T in M["type"]]: (message: Extract<M, { type: T }>) => Promise<unknown>;
};

// Runs the handler for each message meant for this context and answers with its
// result. Only the extension's own contexts are answered, and only with a
// message whose fields are what its type needs. Returns whether it will answer,
// which is what Chrome's onMessage listener has to return to keep the reply
// channel open.
export class CommandRouter<M extends Message> {
  constructor(
    private readonly target: M["target"],
    private readonly handlers: CommandHandlers<M>,
    private readonly guards: MessageGuards<M>,
    private readonly extensionId: string,
  ) {}

  route(
    message: unknown,
    sender: Sender | undefined,
    reply: (reply: Reply<unknown>) => void,
  ): boolean {
    if (
      sender?.id !== this.extensionId ||
      !isMessageFor(message, this.target)
    ) {
      return false;
    }
    const type = message.type;
    if (
      typeof type !== "string" ||
      !Object.hasOwn(this.handlers, type) ||
      !this.guards[type as M["type"]](message)
    ) {
      return false;
    }
    const handler = this.handlers[type as M["type"]] as (
      message: M,
    ) => Promise<unknown>;
    replyWhenDone(handler(message as M), reply);
    return true;
  }
}
