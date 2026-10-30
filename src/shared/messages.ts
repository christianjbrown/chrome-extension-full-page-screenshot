// Everything the service worker, the page and the offscreen document say to each other.

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

export type PageMessage =
  | { target: "page"; type: "prepare" }
  | { target: "page"; type: "scroll"; y: number; hideFixed: boolean }
  | { target: "page"; type: "restore" };

export type OffscreenMessage =
  | { target: "offscreen"; type: "begin"; width: number; height: number }
  | {
      target: "offscreen";
      type: "slice";
      dataUrl: string;
      rects: Rect[];
      scroll: number;
    }
  | { target: "offscreen"; type: "finish" };

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
