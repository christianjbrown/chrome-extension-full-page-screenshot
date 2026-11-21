// Settings for the offscreen document. Only its entry point reads them, and
// hands each one to the part that needs it.
export interface OffscreenConfig {
  // How often to look at the colour scheme, since no change event arrives.
  schemeCheckMs: number;
}

export const OFFSCREEN_CONFIG: OffscreenConfig = {
  schemeCheckMs: 1000,
};
