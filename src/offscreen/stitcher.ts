import type { ObjectUrls } from "./blob-urls";
import type { ImageDecoder } from "./image-decoder";
import type { Part, PartCutter } from "./part-layout";
import type { Bitmap, Surface, SurfaceFactory } from "./surfaces";

// What the service worker asks of the offscreen document.
interface StitchCommands {
  begin(width: number, height: number): Promise<void>;
  // Rows [from, to) of the viewport capture belong at y in the page, all in CSS pixels.
  add(dataUrl: string, from: number, to: number, y: number): Promise<void>;
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
    this.size = { width, height };
    this.picture = undefined;
    return Promise.resolve();
  }

  async add(
    dataUrl: string,
    from: number,
    to: number,
    y: number,
  ): Promise<void> {
    const image = await this.deps.decoder.decode(dataUrl);
    try {
      const picture = this.pictureFor(image);
      const top = Math.round(y * picture.scale);
      const bottom = Math.min(
        picture.height,
        top + Math.round((to - from) * picture.scale),
      );
      await this.paint(picture, image, Math.round(from * picture.scale), {
        top,
        height: bottom - top,
      });
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
    sourceY: number,
    target: Part,
  ): Promise<void> {
    for (const sheet of picture.sheets) {
      if (sheet.top + sheet.height <= target.top) {
        await this.writeOut(sheet);
      } else if (sheet.top < target.top + target.height) {
        sheet.surface ??= this.deps.surfaces.create(
          picture.width,
          sheet.height,
        );
        sheet.surface.draw(
          image,
          sourceY,
          target.height,
          target.top - sheet.top,
        );
      }
    }
  }

  private async writeOut(sheet: Sheet): Promise<void> {
    if (sheet.surface !== undefined) {
      sheet.url = this.deps.urls.create(await sheet.surface.toPng());
      delete sheet.surface;
    }
  }
}
