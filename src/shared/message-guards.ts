import type { OffscreenMessage, PageMessage } from "./messages";
import { isFiniteNumber } from "./numbers";

type Fields = Record<string, unknown>;

// Whether a message that names a type also carries the fields that type needs.
export type MessageGuards<M extends { type: string }> = {
  [T in M["type"]]: (message: unknown) => message is Extract<M, { type: T }>;
};

const isRect = (value: unknown): boolean => {
  const rect = value as Fields | null;
  return (
    typeof rect === "object" &&
    rect !== null &&
    ["x", "y", "width", "height"].every((key) => isFiniteNumber(rect[key]))
  );
};

export const pageGuards: MessageGuards<PageMessage> = {
  prepare: (_message): _message is Extract<PageMessage, { type: "prepare" }> =>
    true,
  scroll: (message): message is Extract<PageMessage, { type: "scroll" }> =>
    isFiniteNumber((message as Fields).y) &&
    typeof (message as Fields).hideFixed === "boolean",
  restore: (_message): _message is Extract<PageMessage, { type: "restore" }> =>
    true,
};

export const offscreenGuards: MessageGuards<OffscreenMessage> = {
  begin: (message): message is Extract<OffscreenMessage, { type: "begin" }> =>
    isFiniteNumber((message as Fields).width) &&
    isFiniteNumber((message as Fields).height),
  slice: (message): message is Extract<OffscreenMessage, { type: "slice" }> => {
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
  ): _message is Extract<OffscreenMessage, { type: "finish" }> => true,
};
