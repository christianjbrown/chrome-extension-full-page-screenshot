// How tall the part of the page on screen is, in CSS pixels.
export interface ViewHeight {
  innerHeight: number;
}

// The size of the part of the page on screen, in CSS pixels.
export interface Viewport extends ViewHeight {
  innerWidth: number;
}
