import type { Command, Message } from "./command";

type TypesOf<C extends readonly unknown[]> = {
  [K in keyof C]: C[K] extends { type: infer T } ? T : never;
};

type HasRepeat<
  T extends readonly unknown[],
  Seen = never,
> = T extends readonly [infer Head, ...infer Rest]
  ? [Head] extends [Seen]
    ? true
    : HasRepeat<Rest, Seen | Head>
  : false;

// The commands themselves when every message type has exactly one, and never
// otherwise, so a missing or doubled command fails to compile.
type OncePerType<M extends Message, C extends readonly Command<M>[]> = [
  Exclude<M["type"], C[number]["type"]>,
] extends [never]
  ? HasRepeat<TypesOf<C>> extends true
    ? never
    : C
  : never;

// Lists a context's commands, checking at compile time that each of its
// message types is handled once.
export const everyCommandOnce =
  <M extends Message>() =>
  <const C extends readonly Command<M>[]>(
    ...commands: C & OncePerType<M, C>
  ): readonly Command<M>[] =>
    commands;
