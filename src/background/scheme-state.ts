import { DARK, type ColourScheme } from "../shared/colour-scheme";
import type { SchemePolicy, SchemeState } from "./scheme-ports";

// Matches the icon the manifest starts with.
export const UNKNOWN_SCHEME: SchemeState = { device: DARK, chrome: null };

export const toolbarScheme = (state: SchemeState): ColourScheme =>
  state.chrome ?? state.device;

export const afterDevice = (
  state: SchemeState,
  device: ColourScheme,
): SchemeState => ({ ...state, device });

// A setting the tab matches is kept, and one it contradicts is cleared.
const keptSetting = (
  chrome: ColourScheme | null,
  tab: ColourScheme,
): ColourScheme | null => (chrome === tab ? tab : null);

// A tab that disagrees with the device means Chrome has its own setting, and
// that is remembered. A tab that agrees with the device only clears a setting
// it contradicts: one it matches may still be there, and would be lost the next
// time the device changes.
export function afterTab(state: SchemeState, tab: ColourScheme): SchemeState {
  if (tab !== state.device) {
    return { ...state, chrome: tab };
  }
  return { ...state, chrome: keptSetting(state.chrome, tab) };
}

export const SCHEME_POLICY: SchemePolicy = {
  afterDevice,
  afterTab,
  toolbarScheme,
};
