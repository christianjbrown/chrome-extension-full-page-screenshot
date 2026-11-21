import type { ColourScheme } from "./colour-scheme";
import type { TARGETS } from "./targets";

// Tells the service worker which colour scheme the device is in.
export const SCHEME = "scheme";

export interface SchemeMessage {
  target: typeof TARGETS.background;
  type: typeof SCHEME;
  scheme: ColourScheme;
}
