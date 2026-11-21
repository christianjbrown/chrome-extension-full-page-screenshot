import type { Command, MessageOf } from "../shared/command";
import type { Fields } from "../shared/fields";
import { PAGE_TYPES, type PageMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import type { PageScroller } from "./page-commands";

type Scroll = typeof PAGE_TYPES.scroll;
type ScrollMessage = MessageOf<PageMessage, Scroll>;

// Scrolls to the next slice and answers with where the page landed.
export class ScrollCommand implements Command<PageMessage, Scroll> {
  readonly type = PAGE_TYPES.scroll;

  constructor(private readonly page: PageScroller) {}

  accepts(message: unknown): message is ScrollMessage {
    const fields = message as Fields;
    return isFiniteNumber(fields.y) && typeof fields.hideFixed === "boolean";
  }

  handle(message: ScrollMessage): Promise<number> {
    return this.page.scrollTo(message.y, message.hideFixed);
  }
}
