// The button's badges, colours and tooltips at each stage. Only the root reads
// them, to build the stages.
export const COLOURS = {
  failed: "#dc2626",
  busy: "#2563eb",
  idle: "#5a5a60",
} as const;

export const BADGES = {
  none: "",
  saving: "...",
  failed: "!",
} as const;

// The button's tooltip. The idle one matches the manifest's default_title.
export const TITLES = {
  idle: "Screenshot this whole page",
  capturing: "Capturing the page. Hold still.",
  saving: "Saving the screenshot",
  failedBecause: "Screenshot failed: ",
} as const;
