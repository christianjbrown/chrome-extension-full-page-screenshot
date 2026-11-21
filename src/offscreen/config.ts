// Settings for the offscreen document. Only its entry point reads them, and
// hands each one to the part that needs it.
export interface OffscreenConfig {
  // How often to look at the colour scheme, since no change event arrives.
  schemeCheckMs: number;
  // Chrome refuses canvases past a certain size, so a taller picture is cut
  // into parts, each its own file. These are the tallest side and the most
  // pixels one part may have.
  maxPartSide: number;
  maxPartPixels: number;
}

const MEBI = 1024 * 1024;

export const OFFSCREEN_CONFIG: OffscreenConfig = {
  schemeCheckMs: 1000,
  maxPartSide: 16384,
  maxPartPixels: 64 * MEBI,
};
