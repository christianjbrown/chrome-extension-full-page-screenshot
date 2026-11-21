// The two looks Chrome's toolbar can have.
export const LIGHT = "light";
export const DARK = "dark";
export const COLOUR_SCHEMES = [LIGHT, DARK] as const;

export type ColourScheme = (typeof COLOUR_SCHEMES)[number];

// True in a document whose look is dark.
export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

export const schemeFor = (prefersDark: boolean): ColourScheme =>
  prefersDark ? DARK : LIGHT;
