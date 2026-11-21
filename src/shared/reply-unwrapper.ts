import { isReply } from "./message-fields";
import type { Reply } from "./messages";
import type { ReplyReader } from "./replies";

const NO_ANSWER = " did not answer";

export class ReplyUnwrapper implements ReplyReader {
  read(reply: unknown, who: string): unknown {
    return this.valueOf(this.answered(reply, who));
  }

  // Nothing at all, or anything a Responder would not send, is no answer.
  private answered(reply: unknown, who: string): Reply<unknown> {
    if (!isReply(reply)) {
      throw new Error(who + NO_ANSWER);
    }
    return reply;
  }

  private valueOf(reply: Reply<unknown>): unknown {
    if (!reply.ok) {
      throw new Error(reply.error);
    }
    return reply.value;
  }
}
