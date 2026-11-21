import type { MessageFilter, Sender } from "./message-filter";
import type { MessageGuards } from "./message-guards";
import type { Reply } from "./messages";
import type { Responder } from "./replies";

interface Message {
  target: string;
  type: string;
}

export type CommandHandlers<M extends Message> = {
  [T in M["type"]]: (message: Extract<M, { type: T }>) => Promise<unknown>;
};

// Runs the handler for each message the filter lets through and answers with
// its result, but only for a message whose fields are what its type needs.
// Returns whether it will answer, which is what Chrome's onMessage listener
// has to return to keep the reply channel open.
export class CommandRouter<M extends Message> {
  constructor(
    private readonly handlers: CommandHandlers<M>,
    private readonly guards: MessageGuards<M>,
    private readonly filter: MessageFilter,
    private readonly responder: Responder,
  ) {}

  route(
    message: unknown,
    sender: Sender | undefined,
    reply: (reply: Reply<unknown>) => void,
  ): boolean {
    if (!this.filter.accepts(message, sender)) {
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
    this.responder.answer(handler(message as M), reply);
    return true;
  }
}
