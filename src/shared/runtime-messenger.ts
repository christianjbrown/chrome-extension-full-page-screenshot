import type { MessageSender } from "./message-sender";

// The part of chrome.runtime that sends a message.
export interface RuntimeChannel {
  sendMessage(message: unknown): Promise<unknown>;
}

export class RuntimeMessenger<M> implements MessageSender<M> {
  constructor(private readonly channel: RuntimeChannel) {}

  send(message: M): Promise<unknown> {
    return this.channel.sendMessage(message);
  }
}
