import type { Placing } from "./geometry";
import type { ImageDecoder } from "./image-decoder";
import type { PageSize, Picture, PictureSizer } from "./picture";
import type { SheetWriter } from "./sheet-writer";
import type {
  SlicePainter,
  StitchFinisher,
  StitchStarter,
} from "./stitch-commands";
import type { Rect } from "../shared/messages";
import { isFiniteNumber, isPositiveNumber } from "../shared/numbers";
import type { Bitmap, SurfaceFactory } from "./surfaces";

const ERRORS = {
  size: "The page has an unusable size",
  scroll: "The page has an unusable scroll position",
} as const;

export interface StitcherDependencies {
  decoder: ImageDecoder;
  sizer: PictureSizer;
  placing: Placing;
  surfaces: SurfaceFactory;
  writer: SheetWriter;
}

// Paints the slices into the output a part at a time. Slices arrive top to
// bottom, so each part is written out as soon as the slices move past it, and
// at most two parts are ever held in memory.
export class Stitcher implements StitchStarter, SlicePainter, StitchFinisher {
  private page: PageSize = { width: 0, height: 0 };
  private picture: Picture | undefined;

  constructor(private readonly deps: StitcherDependencies) {}

  begin(width: number, height: number): Promise<void> {
    if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
      return Promise.reject(new Error(ERRORS.size));
    }
    this.page = { width, height };
    this.picture = undefined;
    return Promise.resolve();
  }

  async add(dataUrl: string, rects: Rect[], scroll: number): Promise<void> {
    if (!isFiniteNumber(scroll)) {
      throw new Error(ERRORS.scroll);
    }
    const image = await this.deps.decoder.decode(dataUrl);
    try {
      this.picture ??= this.deps.sizer.size(image.width, this.page);
      for (const rect of rects) {
        await this.paint(this.picture, image, rect, scroll);
      }
    } finally {
      image.close();
    }
  }

  async finish(): Promise<string[]> {
    const sheets = this.picture?.sheets ?? [];
    const urls: string[] = [];
    for (const sheet of sheets) {
      await this.deps.writer.writeOut(sheet);
      if (sheet.url !== undefined) {
        urls.push(sheet.url);
      }
    }
    this.picture = undefined;
    return urls;
  }

  private async paint(
    picture: Picture,
    image: Bitmap,
    rect: Rect,
    scroll: number,
  ): Promise<void> {
    const { source, top } = this.deps.placing.place(
      rect,
      scroll,
      picture.scale,
      picture.height,
    );
    for (const sheet of picture.sheets) {
      if (sheet.top + sheet.height <= top) {
        await this.deps.writer.writeOut(sheet);
      } else if (sheet.top < top + source.height) {
        sheet.surface ??= this.deps.surfaces.create(
          picture.width,
          sheet.height,
        );
        sheet.surface.draw(image, source, top - sheet.top);
      }
    }
  }
}
