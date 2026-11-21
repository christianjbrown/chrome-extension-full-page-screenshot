import { isColourScheme } from "./colour-scheme";
import type {
  BACKGROUND_TYPES,
  BackgroundMessage,
  OFFSCREEN_TYPES,
  OffscreenMessage,
  PAGE_TYPES,
  PageMessage,
  Rect,
} from "./messages";
import { isFiniteNumber } from "./numbers";

type Fields = Record<string, unknown>;

// Whether a message that names a type also carries the fields that type needs.
export type MessageGuards<M extends { type: string }> = {
  [T in M["type"]]: (message: unknown) => message is Extract<M, { type: T }>;
};

type Of<M, T> = Extract<M, { type: T }>;

const RECT_KEYS = [
  "x",
  "y",
  "width",
  "height",
] as const satisfies readonly (keyof Rect)[];

const isRect = (value: unknown): boolean => {
  const rect = value as Fields | null;
  return (
    typeof rect === "object" &&
    rect !== null &&
    RECT_KEYS.every((key) => isFiniteNumber(rect[key]))
  );
};

export const pageGuards: MessageGuards<PageMessage> = {
  prepare: (_message): _message is Of<PageMessage, typeof PAGE_TYPES.prepare> =>
    true,
  scroll: (message): message is Of<PageMessage, typeof PAGE_TYPES.scroll> =>
    isFiniteNumber((message as Fields).y) &&
    typeof (message as Fields).hideFixed === "boolean",
  restore: (_message): _message is Of<PageMessage, typeof PAGE_TYPES.restore> =>
    true,
};

export const offscreenGuards: MessageGuards<OffscreenMessage> = {
  begin: (
    message,
  ): message is Of<OffscreenMessage, typeof OFFSCREEN_TYPES.begin> =>
    isFiniteNumber((message as Fields).width) &&
    isFiniteNumber((message as Fields).height),
  slice: (
    message,
  ): message is Of<OffscreenMessage, typeof OFFSCREEN_TYPES.slice> => {
    const fields = message as Fields;
    return (
      typeof fields.dataUrl === "string" &&
      isFiniteNumber(fields.scroll) &&
      Array.isArray(fields.rects) &&
      fields.rects.every(isRect)
    );
  },
  finish: (
    _message,
  ): _message is Of<OffscreenMessage, typeof OFFSCREEN_TYPES.finish> => true,
};

export const backgroundGuards: MessageGuards<BackgroundMessage> = {
  scheme: (
    message,
  ): message is Of<BackgroundMessage, typeof BACKGROUND_TYPES.scheme> =>
    isColourScheme((message as Fields).scheme),
};
