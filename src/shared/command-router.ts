import type { Command, Message } from "./command";
import type { Fields } from "./fields";
import type { MessageFilter, Sender } from "./message-filter";
import type { Reply } from "./messages";
import type { Responder } from "./replies";

// Runs the command for each message the filter lets through and answers with
// its result, but only for a message whose fields are what its type needs.
// Returns whether it will answer, which is what Chrome's onMessage listener
// has to return to keep the reply channel open.
export class CommandRouter<M extends Message> {
  // Keyed by anything, so a message whose type is not a string finds nothing.
  private readonly commands: ReadonlyMap<unknown, Command<M>>;

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
    return this.dispatch(message, reply);
  }

  private dispatch(
    message: Fields,
    reply: (reply: Reply<unknown>) => void,
  ): boolean {
    const command = this.commands.get(message.type);
    if (command === undefined) {
      return false;
    }
    return this.run(command, message, reply);
  }

  private run(
    command: Command<M>,
    message: unknown,
    reply: (reply: Reply<unknown>) => void,
  ): boolean {
    if (!command.accepts(message)) {
      return false;
    }
    this.responder.answer(command.handle(message), reply);
    return true;
  }
}
