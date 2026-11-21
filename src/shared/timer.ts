// Calls back once after a delay, the way setTimeout does.
export type Timer = (callback: () => void, ms: number) => unknown;
