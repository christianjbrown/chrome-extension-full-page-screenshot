import type { Reply } from "./messages";

// Answers a message once its work settles.
export interface Responder {
  answer<T>(work: Promise<T>, reply: (reply: Reply<T>) => void): void;
}

// The other side of a Responder: what a reply carried.
export interface ReplyReader {
  // The value, or the other side's error thrown here. Who names the other
  // side when it gave no answer at all.
  read(reply: unknown, who: string): unknown;
}
