import { errorMessage } from "./error-message";
import type { Reply } from "./messages";

// Answers a message once its work settles, with the value or the reason it failed.
export function replyWhenDone<T>(
  work: Promise<T>,
  reply: (reply: Reply<T>) => void,
): void {
  work.then(
    (value) => {
      reply({ ok: true, value });
    },
    (error: unknown) => {
      reply({ ok: false, error: errorMessage(error) });
    },
  );
}

const NO_ANSWER = " did not answer";

// The other side of replyWhenDone: the value, or the other side's error thrown here.
export function unwrap(reply: unknown, who: string): unknown {
  const typed = reply as Reply<unknown> | undefined;
  if (typed === undefined) {
    throw new Error(who + NO_ANSWER);
  }
  if (!typed.ok) {
    throw new Error(typed.error);
  }
  return typed.value;
}
