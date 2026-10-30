import { isMessageFor, type Reply } from "./messages";
import { replyWhenDone } from "./replies";

interface Message {
  target: string;
  type: string;
}

export type CommandHandlers<M extends Message> = {
  [T in M["type"]]: (message: Extract<M, { type: T }>) => Promise<unknown>;
};

// Runs the handler for each message meant for this context and answers with its
// result. Returns whether it will answer, which is what Chrome's onMessage
// listener has to return to keep the reply channel open.
export class CommandRouter<M extends Message> {
  constructor(
    private readonly target: M["target"],
    private readonly handlers: CommandHandlers<M>,
  ) {}

  route(message: unknown, reply: (reply: Reply<unknown>) => void): boolean {
    if (!isMessageFor(message, this.target)) {
      return false;
    }
    const handler = this.handlers[message.type as M["type"]] as
      ((message: M) => Promise<unknown>) | undefined;
    if (handler === undefined) {
      return false;
    }
    replyWhenDone(handler(message as M), reply);
    return true;
  }
}
