import type { Fields } from "./fields";

// Who sent a message, as far as Chrome says.
export interface Sender {
  id?: string | undefined;
}

// Decides which runtime messages a context looks at at all.
export interface MessageFilter {
  accepts(
    message: unknown,
    sender: Sender | undefined,
  ): message is Fields & { target: string };
}
