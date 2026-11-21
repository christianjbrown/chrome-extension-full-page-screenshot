// Everything the service worker, the page and the offscreen document say to
// each other. Each message is declared in its own module, so a new one is that
// module and one line here.
import type { BeginMessage } from "./begin-message";
import { isFields } from "./fields";
import type { FinishMessage } from "./finish-message";
import type { PrepareMessage } from "./prepare-message";
import type { RestoreMessage } from "./restore-message";
import type { SchemeMessage } from "./scheme-message";
import type { ScrollMessage } from "./scroll-message";
import type { SliceMessage } from "./slice-message";

export type PageMessage = PrepareMessage | ScrollMessage | RestoreMessage;

export type OffscreenMessage = BeginMessage | SliceMessage | FinishMessage;

export type BackgroundMessage = SchemeMessage;

export type Reply<T> = { ok: true; value: T } | { ok: false; error: string };

// Every runtime message reaches every context, so each one picks out its own.
export function isMessageFor(
  message: unknown,
  target: string,
): message is { target: string; type: string } {
  return isFields(message) && message.target === target;
}
