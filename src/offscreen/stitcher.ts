import type { ObjectUrls } from "./blob-urls";
import type { ImageDecoder } from "./image-decoder";
import type { Part, PartCutter } from "./part-layout";
import type { Rect } from "../shared/messages";
import { isFiniteNumber, isPositiveNumber } from "../shared/numbers";
import type { Bitmap, Box, Surface, SurfaceFactory } from "./surfaces";

// What the service worker asks of the offscreen document.
interface StitchCommands {
  begin(width: number, height: number): Promise<void>;
  // Each box of the viewport capture belongs in the page at its own position
  // plus the scroll, all in CSS pixels.
  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void>;
  // Blob URLs of the finished PNGs, one per part, top to bottom.
  finish(): Promise<string[]>;
}

export interface StitcherDependencies {
  decoder: ImageDecoder;
  cutter: PartCutter;
  surfaces: SurfaceFactory;
  urls: ObjectUrls;
}

interface Sheet extends Part {
  surface?: Surface;
  url?: string;
}

interface Picture {
  width: number;
  height: number;
  scale: number;
  sheets: Sheet[];
}

// Paints the slices into the output a part at a time. Slices arrive top to
// bottom, so each part is written out as soon as the slices move past it, and
// at most two parts are ever held in memory.
export class Stitcher implements StitchCommands {
  private size = { width: 0, height: 0 };
  private picture: Picture | undefined;

  constructor(private readonly deps: StitcherDependencies) {}

  begin(width: number, height: number): Promise<void> {
    if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
      return Promise.reject(new Error("The page has an unusable size"));
    }
    this.size = { width, height };
    this.picture = undefined;
    return Promise.resolve();
  }

  async add(dataUrl: string, rects: Rect[], scroll: number): Promise<void> {
    if (!isFiniteNumber(scroll)) {
      throw new Error("The page has an unusable scroll position");
    }
    const image = await this.deps.decoder.decode(dataUrl);
    try {
      const picture = this.pictureFor(image);
      for (const rect of rects) {
        await this.paint(picture, image, rect, scroll);
      }
    } finally {
      image.close();
    }
  }

  async finish(): Promise<string[]> {
    const sheets = this.picture?.sheets ?? [];
    const urls: string[] = [];
    for (const sheet of sheets) {
      await this.writeOut(sheet);
      if (sheet.url !== undefined) {
        urls.push(sheet.url);
      }
    }
    this.picture = undefined;
    return urls;
  }

  // The capture's own width fixes the scale, which takes in the screen's pixel
  // ratio and the page zoom together.
  private pictureFor(image: Bitmap): Picture {
    if (this.picture === undefined) {
      if (!isPositiveNumber(image.width)) {
        throw new Error("The capture has no width");
      }
      const scale = image.width / this.size.width;
      const height = Math.round(this.size.height * scale);
      this.picture = {
        width: image.width,
        height,
        scale,
        sheets: this.deps.cutter.partsFor(image.width, height),
      };
    }
    return this.picture;
  }

  private async paint(
    picture: Picture,
    image: Bitmap,
    rect: Rect,
    scroll: number,
  ): Promise<void> {
    const { source, top } = this.toDevice(picture, rect, scroll);
    for (const sheet of picture.sheets) {
      if (sheet.top + sheet.height <= top) {
        await this.writeOut(sheet);
      } else if (sheet.top < top + source.height) {
        sheet.surface ??= this.deps.surfaces.create(
          picture.width,
          sheet.height,
        );
        sheet.surface.draw(image, source, top - sheet.top);
      }
    }
  }

  // Where the box sits in the capture and in the picture, in device pixels,
  // cut off at the bottom of the picture.
  private toDevice(
    picture: Picture,
    rect: Rect,
    scroll: number,
  ): { source: Box; top: number } {
    const scaled = (value: number) => Math.round(value * picture.scale);
    const top = scaled(rect.y + scroll);
    const height = Math.min(picture.height, top + scaled(rect.height)) - top;
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

  private async writeOut(sheet: Sheet): Promise<void> {
    if (sheet.surface !== undefined) {
      sheet.url = this.deps.urls.create(await sheet.surface.toPng());
      delete sheet.surface;
    }
  }
}
