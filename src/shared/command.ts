// What every message between the extension's contexts carries.
export interface Message {
  target: string;
  type: string;
}

// The message of one type.
export type MessageOf<M extends Message, T extends M["type"]> = Extract<
  M,
  { type: T }
>;

// The work one type of message asks for. A new message is a new command.
export interface Command<M extends Message, T extends M["type"] = M["type"]> {
  readonly type: T;
  // Whether the message carries the fields its type needs.
  accepts(message: unknown): message is MessageOf<M, T>;
  handle(message: MessageOf<M, T>): Promise<unknown>;
}
