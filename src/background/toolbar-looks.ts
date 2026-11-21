// The button's look at each stage, one look per stage. Only the root reads
// them, to build the stages.
import type { Look } from "./screenshot-indicator";

// A look whose badge is worked out as the stage goes, such as the percentage
// captured so far.
export type UnbadgedLook = Omit<Look, "badge">;

const NO_BADGE = "";
// Capturing and saving share a colour, so the button stays blue until it is done.
const BUSY_COLOUR = "#2563eb";

// Its tooltip matches the manifest's default_title.
export const IDLE_LOOK: Look = {
  badge: NO_BADGE,
  colour: "#5a5a60",
  title: "Screenshot this whole page",
};

export const CAPTURING_LOOK: UnbadgedLook = {
  colour: BUSY_COLOUR,
  title: "Capturing the page. Hold still.",
};

export const SAVING_LOOK: Look = {
  badge: "...",
  colour: BUSY_COLOUR,
  title: "Saving the screenshot",
};

// The reason it failed follows the title.
export const FAILED_LOOK: Look = {
  badge: "!",
  colour: "#dc2626",
  title: "Screenshot failed: ",
};
