// The two looks Chrome's toolbar can have.
export const COLOUR_SCHEMES = ["light", "dark"] as const;

export type ColourScheme = (typeof COLOUR_SCHEMES)[number];
