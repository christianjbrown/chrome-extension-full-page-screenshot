import type { Rect } from "../shared/messages";
import type { Placement, Placing, Scaling } from "./geometry";

export class DeviceGeometry implements Scaling, Placing {
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
