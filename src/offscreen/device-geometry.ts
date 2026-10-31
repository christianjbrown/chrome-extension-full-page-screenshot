import type { Rect } from "../shared/messages";
import type { Box } from "./surfaces";

export interface Placement {
  source: Box;
  top: number;
}

// Turns the page's CSS pixels into the capture's device pixels.
export interface Geometry {
  // The capture's own width fixes the scale, which takes in the screen's pixel
  // ratio and the page zoom together.
  scaleFor(captureWidth: number, pageWidth: number): number;
  heightOf(pageHeight: number, scale: number): number;
  // Where the box sits in the capture and in the picture, cut off at the
  // bottom of the picture.
  place(
    rect: Rect,
    scroll: number,
    scale: number,
    pictureHeight: number,
  ): Placement;
}

export class DeviceGeometry implements Geometry {
  scaleFor(captureWidth: number, pageWidth: number): number {
    return captureWidth / pageWidth;
  }

  heightOf(pageHeight: number, scale: number): number {
    return Math.round(pageHeight * scale);
  }

  place(
    rect: Rect,
    scroll: number,
    scale: number,
    pictureHeight: number,
  ): Placement {
    const scaled = (value: number) => Math.round(value * scale);
    const top = scaled(rect.y + scroll);
    const height = Math.min(pictureHeight, top + scaled(rect.height)) - top;
    return {
      source: {
        x: scaled(rect.x),
        y: scaled(rect.y),
        width: scaled(rect.width),
        height,
      },
      top,
    };
  }
}
