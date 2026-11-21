import { DARK, type ColourScheme } from "../shared/colour-scheme";

// What is known about the colour of Chrome's toolbar.
//
// Chrome has its own Light and Dark setting, which can differ from the
// device's. The offscreen document only ever sees the device's, and only a
// page in a tab sees Chrome's, so both are kept.
export interface SchemeState {
  // What the device is in, as the offscreen document last saw it.
  device: ColourScheme;
  // What Chrome is set to, once a tab has shown that it differs from the device.
  chrome: ColourScheme | null;
}

// Matches the icon the manifest starts with.
export const UNKNOWN_SCHEME: SchemeState = { device: DARK, chrome: null };

export const toolbarScheme = (state: SchemeState): ColourScheme =>
  state.chrome ?? state.device;

export const afterDevice = (
  state: SchemeState,
  device: ColourScheme,
): SchemeState => ({ ...state, device });

// A tab that disagrees with the device means Chrome has its own setting, and
// that is remembered. A tab that agrees with the device only clears a setting
// it contradicts: one it matches may still be there, and would be lost the next
// time the device changes.
export function afterTab(state: SchemeState, tab: ColourScheme): SchemeState {
  if (tab !== state.device) {
    return { ...state, chrome: tab };
  }
  return { ...state, chrome: state.chrome === tab ? tab : null };
}

// How each report moves the state on, and which scheme the toolbar is in.
export interface SchemePolicy {
  afterDevice(state: SchemeState, device: ColourScheme): SchemeState;
  afterTab(state: SchemeState, tab: ColourScheme): SchemeState;
  toolbarScheme(state: SchemeState): ColourScheme;
}

export const SCHEME_POLICY: SchemePolicy = {
  afterDevice,
  afterTab,
  toolbarScheme,
};
