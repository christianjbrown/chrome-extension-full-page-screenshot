import type { Rect } from "../shared/messages";
import type { Box } from "./surfaces";

// Where a box of the capture goes in the picture.
export interface Placement {
  source: Box;
  top: number;
}

// Turns the page's CSS pixels into the capture's device pixels.
export interface Scaling {
  // The capture's own width fixes the scale, which takes in the screen's pixel
  // ratio and the page zoom together.
  scaleFor(captureWidth: number, pageWidth: number): number;
  heightOf(pageHeight: number, scale: number): number;
}

export interface Placing {
  // Where the box sits in the capture and in the picture, cut off at the
  // bottom of the picture.
  place(
    rect: Rect,
    scroll: number,
    scale: number,
    pictureHeight: number,
  ): Placement;
}
