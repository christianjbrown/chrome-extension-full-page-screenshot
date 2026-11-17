import type { ColourScheme } from "../shared/colour-scheme";
import type { BackgroundMessage } from "../shared/messages";

export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
export const SCHEME_CHECK_MS = 1000;

// The part of a MediaQueryList this needs.
export interface SchemeQuery {
  readonly matches: boolean;
}

export interface MessageChannel {
  sendMessage(message: BackgroundMessage): Promise<unknown>;
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
    private readonly channel: MessageChannel,
    private readonly repeat: Repeat,
  ) {}

  start(): void {
    this.check();
    this.repeat(() => {
      this.check();
    }, SCHEME_CHECK_MS);
  }

  // Nobody waits for an answer: the service worker repaints the button. A
  // report that did not arrive is forgotten, so the next look sends it again.
  private check(): void {
    const scheme: ColourScheme = this.dark.matches ? "dark" : "light";
    if (scheme === this.reported) {
      return;
    }
    this.reported = scheme;
    this.channel
      .sendMessage({ target: "background", type: "scheme", scheme })
      .catch(() => {
        this.reported = undefined;
      });
  }
}
