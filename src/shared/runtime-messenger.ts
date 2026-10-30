import type { MessageSender } from "./messages";

export interface MessageChannel {
  sendMessage(message: unknown): Promise<unknown>;
}

export class RuntimeMessenger<M> implements MessageSender<M> {
  constructor(private readonly channel: MessageChannel) {}

  send(message: M): Promise<unknown> {
    return this.channel.sendMessage(message);
  }
}
