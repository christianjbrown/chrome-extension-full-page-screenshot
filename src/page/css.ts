// The CSS the page script reads and overrides, named once for every file that uses it.
export const PROPERTY = {
  scrollBehavior: "scroll-behavior",
  scrollbarWidth: "scrollbar-width",
  position: "position",
  inset: "inset",
  opacity: "opacity",
  transition: "transition",
} as const;

export const VALUE = {
  auto: "auto",
  none: "none",
  relative: "relative",
  invisible: "0",
  // What an element has when no rule positions it or lets it scroll.
  static: "static",
  visible: "visible",
} as const;

// Computed position values that take an element out of the page's flow.
export const POSITION = {
  sticky: "sticky",
  fixed: "fixed",
} as const;

// Computed overflow-y values that let an element scroll its own content.
export const SCROLLING_OVERFLOW: readonly string[] = [
  VALUE.auto,
  "scroll",
  "overlay",
];

// Every override beats the page's own rules.
export const IMPORTANT = "important";

export const EVERY_ELEMENT = "*";
