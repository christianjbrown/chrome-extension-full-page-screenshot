import { errorMessage } from "./error-message";
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

const NO_ANSWER = " did not answer";

// Answers with the value, or the reason the work failed.
export class SettledResponder implements Responder {
  answer<T>(work: Promise<T>, reply: (reply: Reply<T>) => void): void {
    work.then(
      (value) => {
        reply({ ok: true, value });
      },
      (error: unknown) => {
        reply({ ok: false, error: errorMessage(error) });
      },
    );
  }
}

export class ReplyUnwrapper implements ReplyReader {
  read(reply: unknown, who: string): unknown {
    const typed = reply as Reply<unknown> | undefined;
    if (typed === undefined) {
      throw new Error(who + NO_ANSWER);
    }
    if (!typed.ok) {
      throw new Error(typed.error);
    }
    return typed.value;
  }
}
