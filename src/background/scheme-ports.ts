// The parts that keep the toolbar icon in the colour scheme Chrome is in.
import type { ColourScheme } from "../shared/colour-scheme";

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

// How each report moves the state on, and which scheme the toolbar is in.
export interface SchemePolicy {
  afterDevice(state: SchemeState, device: ColourScheme): SchemeState;
  afterTab(state: SchemeState, tab: ColourScheme): SchemeState;
  toolbarScheme(state: SchemeState): ColourScheme;
}

// Reads the scheme a tab is showing, when the tab can be asked.
export interface SchemeReader {
  read(tabId: number): Promise<ColourScheme | undefined>;
}

// Hears which scheme a tab showed.
export interface TabSchemeSink {
  tabShows(scheme: ColourScheme): Promise<void>;
}

// Keeps the state across service worker sleeps.
export interface SchemeMemory {
  load(): Promise<SchemeState>;
  save(state: SchemeState): Promise<void>;
}

// Puts the toolbar button in a scheme.
export interface SchemeIcon {
  show(scheme: ColourScheme): Promise<void>;
}
