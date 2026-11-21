import type { TARGETS } from "./targets";

// Asks the page to go back to how the capture found it.
export const RESTORE = "restore";

export interface RestoreMessage {
  target: typeof TARGETS.page;
  type: typeof RESTORE;
}
