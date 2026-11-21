import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import type { PageMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import { SCROLL, type ScrollMessage } from "../shared/scroll-message";
import type { PageScroller } from "./page-commands";

// Scrolls to the next slice and answers with where the page landed.
export class ScrollCommand implements Command<PageMessage, typeof SCROLL> {
  readonly type = SCROLL;

  constructor(private readonly page: PageScroller) {}

  accepts(message: unknown): message is ScrollMessage {
    const fields = message as Fields;
    return isFiniteNumber(fields.y) && typeof fields.hideFixed === "boolean";
  }

  handle(message: ScrollMessage): Promise<number> {
    return this.page.scrollTo(message.y, message.hideFixed);
  }
}
