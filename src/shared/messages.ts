// Everything the service worker, the page and the offscreen document say to each other.

// Where the page scrolls, in CSS pixels. The frame is the band of the viewport
// that scrolls: all of it for a normal page, or one inner element's box when
// the page scrolls inside that instead.
export interface PageLayout {
  viewportWidth: number;
  viewportHeight: number;
  frameTop: number;
  frameHeight: number;
  scrollHeight: number;
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
      from: number;
      to: number;
      y: number;
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
