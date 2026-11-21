import type { Reply } from "./messages";
import type { ReplyReader } from "./replies";

const NO_ANSWER = " did not answer";

export class ReplyUnwrapper implements ReplyReader {
  read(reply: unknown, who: string): unknown {
    return this.valueOf(this.answered(reply, who));
  }

  private answered(reply: unknown, who: string): Reply<unknown> {
    if (reply === undefined) {
      throw new Error(who + NO_ANSWER);
    }
    return reply as Reply<unknown>;
  }

  private valueOf(reply: Reply<unknown>): unknown {
    if (!reply.ok) {
      throw new Error(reply.error);
    }
    return reply.value;
  }
}
