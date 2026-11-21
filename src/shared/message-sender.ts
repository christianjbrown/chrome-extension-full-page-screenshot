// Sends a message to the extension's other contexts.
export interface MessageSender<M> {
  send(message: M): Promise<unknown>;
}
