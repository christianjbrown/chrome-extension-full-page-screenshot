import { schemeFor, type ColourScheme } from "../shared/colour-scheme";
import {
  BACKGROUND_TYPES,
  TARGETS,
  type BackgroundMessage,
} from "../shared/messages";
import type { MessageSender } from "../shared/message-sender";

// The part of a MediaQueryList this needs.
export interface SchemeQuery {
  readonly matches: boolean;
}

// Runs the work again and again, the way setInterval does.
export type Repeat = (work: () => void, everyMs: number) => void;

// Tells the service worker which colour scheme Chrome is in, now and whenever
// it changes. A service worker has no matchMedia, so a document has to look.
//
// It looks on a timer because an offscreen document never paints, and Chrome
// only delivers a media query's change event when a frame is painted.
export class SchemeReporter {
  private reported: ColourScheme | undefined;

  constructor(
    private readonly dark: SchemeQuery,
    private readonly messages: MessageSender<BackgroundMessage>,
    private readonly repeat: Repeat,
    private readonly everyMs: number,
  ) {}

  start(): void {
    this.check();
    this.repeat(() => {
      this.check();
    }, this.everyMs);
  }

  // Nobody waits for an answer: the service worker repaints the button. A
  // report that did not arrive is forgotten, so the next look sends it again.
  private check(): void {
    const scheme = schemeFor(this.dark.matches);
    if (scheme === this.reported) {
      return;
    }
    this.reported = scheme;
    this.messages
      .send({
        target: TARGETS.background,
        type: BACKGROUND_TYPES.scheme,
        scheme,
      })
      .catch(() => {
        this.reported = undefined;
      });
  }
}
