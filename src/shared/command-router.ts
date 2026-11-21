import type { Command, Message } from "./command";
import type { MessageFilter, Sender } from "./message-filter";
import type { Reply } from "./messages";
import type { Responder } from "./replies";

// Runs the command for each message the filter lets through and answers with
// its result, but only for a message whose fields are what its type needs.
// Returns whether it will answer, which is what Chrome's onMessage listener
// has to return to keep the reply channel open.
export class CommandRouter<M extends Message> {
  private readonly commands: ReadonlyMap<string, Command<M>>;

  constructor(
    commands: readonly Command<M>[],
    private readonly filter: MessageFilter,
    private readonly responder: Responder,
  ) {
    this.commands = new Map(commands.map((command) => [command.type, command]));
  }

  route(
    message: unknown,
    sender: Sender | undefined,
    reply: (reply: Reply<unknown>) => void,
  ): boolean {
    if (!this.filter.accepts(message, sender)) {
      return false;
    }
    const { type } = message;
    const command =
      typeof type === "string" ? this.commands.get(type) : undefined;
    if (command?.accepts(message) !== true) {
      return false;
    }
    this.responder.answer(command.handle(message), reply);
    return true;
  }
}
