// Everything the service worker, the page and the offscreen document say to each other.
import type { ColourScheme } from "./colour-scheme";

// Where the page scrolls, in CSS pixels. The frame is the part of the viewport
// that scrolls: all of it for a normal page, or one inner element's box when
// the page scrolls inside that instead, as Gmail's message pane does.
export interface PageLayout {
  viewportWidth: number;
  viewportHeight: number;
  frameTop: number;
  frameHeight: number;
  frameLeft: number;
  frameWidth: number;
  scrollHeight: number;
}

// A box in the viewport, in CSS pixels.
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Which context a message is for.
export const TARGETS = {
  background: "background",
  offscreen: "offscreen",
  page: "page",
} as const;

// What each context can be asked to do.
export const PAGE_TYPES = {
  prepare: "prepare",
  scroll: "scroll",
  restore: "restore",
} as const;

export const OFFSCREEN_TYPES = {
  begin: "begin",
  slice: "slice",
  finish: "finish",
} as const;

export const BACKGROUND_TYPES = { scheme: "scheme" } as const;

type ToPage = typeof TARGETS.page;
type ToOffscreen = typeof TARGETS.offscreen;

export type PageMessage =
  | { target: ToPage; type: typeof PAGE_TYPES.prepare }
  | {
      target: ToPage;
      type: typeof PAGE_TYPES.scroll;
      y: number;
      hideFixed: boolean;
    }
  | { target: ToPage; type: typeof PAGE_TYPES.restore };

export type OffscreenMessage =
  | {
      target: ToOffscreen;
      type: typeof OFFSCREEN_TYPES.begin;
      width: number;
      height: number;
    }
  | {
      target: ToOffscreen;
      type: typeof OFFSCREEN_TYPES.slice;
      dataUrl: string;
      rects: Rect[];
      scroll: number;
    }
  | { target: ToOffscreen; type: typeof OFFSCREEN_TYPES.finish };

export interface BackgroundMessage {
  target: typeof TARGETS.background;
  type: typeof BACKGROUND_TYPES.scheme;
  scheme: ColourScheme;
}

export type Reply<T> = { ok: true; value: T } | { ok: false; error: string };

export interface MessageSender<M> {
  send(message: M): Promise<unknown>;
}

// Every runtime message reaches every context, so each one picks out its own.
export function isMessageFor(
  message: unknown,
  target: string,
): message is { target: string; type: string } {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as { target?: unknown }).target === target
  );
}
