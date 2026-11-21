import type { Command } from "../shared/command";
import type { Fields } from "../shared/fields";
import { isAddressed, type PageMessage } from "../shared/messages";
import { isFiniteNumber } from "../shared/numbers";
import { SCROLL, type ScrollMessage } from "../shared/scroll-message";
import { TARGETS } from "../shared/targets";
import type { PageScroller } from "./page-commands";

// Where to scroll to, and whether to hide what stays fixed on screen.
const carries = (fields: Fields): boolean =>
  isFiniteNumber(fields.y) && typeof fields.hideFixed === "boolean";

// Scrolls to the next slice and answers with where the page landed.
export class ScrollCommand implements Command<PageMessage, typeof SCROLL> {
  readonly type = SCROLL;

  constructor(private readonly page: PageScroller) {}

  accepts(message: unknown): message is ScrollMessage {
    return isAddressed(message, TARGETS.page, SCROLL) && carries(message);
  }

  handle(message: ScrollMessage): Promise<number> {
    return this.page.scrollTo(message.y, message.hideFixed);
  }
}
