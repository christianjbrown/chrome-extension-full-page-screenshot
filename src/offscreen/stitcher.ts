import type { Placement, Placing } from "./geometry";
import type { ImageDecoder } from "./image-decoder";
import type { Part } from "./part-layout";
import type { PageSize, Picture, PictureSizer } from "./picture";
import type { Sheet } from "./sheet";
import type { SheetWriter } from "./sheet-writer";
import type {
  SlicePainter,
  StitchFinisher,
  StitchStarter,
} from "./stitch-commands";
import type { Rect } from "../shared/rect";
import { isFiniteNumber, isPositiveNumber } from "../shared/numbers";
import type { Bitmap, SurfaceFactory } from "./surfaces";

const ERRORS = {
  size: "The page has an unusable size",
  scroll: "The page has an unusable scroll position",
} as const;

const isPositiveSize = (width: number, height: number): boolean =>
  isPositiveNumber(width) && isPositiveNumber(height);

const hasUrl = (url: string | undefined): url is string => url !== undefined;

// The decoder and the surfaces agree on the kind of image, so what one makes
// the other can paint.
export interface StitcherDependencies<I extends Bitmap> {
  decoder: ImageDecoder<I>;
  sizer: PictureSizer;
  placing: Placing;
  surfaces: SurfaceFactory<I>;
  writer: SheetWriter;
}

// The picture being painted, and a sheet for each of its parts.
interface Painting<I extends Bitmap> {
  picture: Picture;
  sheets: Sheet<I>[];
}

// Paints the slices into the output a part at a time. Slices arrive top to
// bottom, so each part is written out as soon as the slices move past it, and
// at most two parts are ever held in memory.
export class Stitcher<I extends Bitmap>
  implements StitchStarter, SlicePainter, StitchFinisher
{
  private page: PageSize = { width: 0, height: 0 };
  private painting: Painting<I> | undefined;

  constructor(private readonly deps: StitcherDependencies<I>) {}

  begin(width: number, height: number): Promise<void> {
    if (!isPositiveSize(width, height)) {
      return Promise.reject(new Error(ERRORS.size));
    }
    this.page = { width, height };
    this.painting = undefined;
    return Promise.resolve();
  }

  async add(dataUrl: string, rects: Rect[], scroll: number): Promise<void> {
    if (!isFiniteNumber(scroll)) {
      throw new Error(ERRORS.scroll);
    }
    const image = await this.deps.decoder.decode(dataUrl);
    try {
      await this.paintAll(this.paintingFor(image), image, rects, scroll);
    } finally {
      image.close();
    }
  }

  async finish(): Promise<string[]> {
    const urls = await this.writeAll(this.sheets());
    this.painting = undefined;
    return urls;
  }

  // The first capture sets the picture's size.
  private paintingFor(image: I): Painting<I> {
    this.painting ??= this.blank(this.deps.sizer.size(image.width, this.page));
    return this.painting;
  }

  private blank(picture: Picture): Painting<I> {
    return {
      picture,
      sheets: picture.parts.map((part: Part) => ({ part, paint: {} })),
    };
  }

  // Nothing painted yet means nothing to write.
  private sheets(): Sheet<I>[] {
    return this.painting === undefined ? [] : this.painting.sheets;
  }

  private async writeAll(sheets: Sheet<I>[]): Promise<string[]> {
    for (const sheet of sheets) {
      await this.deps.writer.writeOut(sheet.paint);
    }
    return sheets.map((sheet) => sheet.paint.url).filter(hasUrl);
  }

  private async paintAll(
    painting: Painting<I>,
    image: I,
    rects: Rect[],
    scroll: number,
  ): Promise<void> {
    for (const rect of rects) {
      await this.paint(painting, image, rect, scroll);
    }
  }

  private async paint(
    { picture, sheets }: Painting<I>,
    image: I,
    rect: Rect,
    scroll: number,
  ): Promise<void> {
    const placement = this.deps.placing.place(
      rect,
      scroll,
      picture.scale,
      picture.height,
    );
    for (const sheet of sheets) {
      await this.paintSheet(picture, sheet, image, placement);
    }
  }

  // A sheet the slices have moved past is finished, so it is written out.
  private async paintSheet(
    picture: Picture,
    sheet: Sheet<I>,
    image: I,
    placement: Placement,
  ): Promise<void> {
    if (sheet.part.top + sheet.part.height <= placement.top) {
      await this.deps.writer.writeOut(sheet.paint);
      return;
    }
    this.drawIfCovered(picture, sheet, image, placement);
  }

  private drawIfCovered(
    picture: Picture,
    sheet: Sheet<I>,
    image: I,
    placement: Placement,
  ): void {
    if (sheet.part.top < placement.top + placement.source.height) {
      this.draw(picture, sheet, image, placement);
    }
  }

  // A sheet gets its surface when the first slice reaches it.
  private draw(
    picture: Picture,
    { part, paint }: Sheet<I>,
    image: I,
    { source, top }: Placement,
  ): void {
    paint.surface ??= this.deps.surfaces.create(picture.width, part.height);
    paint.surface.draw(image, source, top - part.top);
  }
}
