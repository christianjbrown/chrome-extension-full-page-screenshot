import type { Reply } from "./messages";
import type { ReplyReader } from "./replies";

const NO_ANSWER = " did not answer";

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
