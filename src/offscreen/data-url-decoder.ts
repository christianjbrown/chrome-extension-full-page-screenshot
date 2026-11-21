import { PNG_TYPE } from "../shared/png";
import type { ImageDecoder } from "./image-decoder";
import type { Bitmap } from "./surfaces";

export type Fetcher = (url: string) => Promise<{ blob(): Promise<Blob> }>;
export type BitmapMaker<I extends Bitmap> = (blob: Blob) => Promise<I>;

const PNG_DATA_URL = `data:${PNG_TYPE};base64,`;
const NOT_PNG = "The capture is not a PNG data URL";

// The capture comes from another context, so even its type is checked.
const isPngDataUrl = (value: unknown): boolean =>
  typeof value === "string" && value.startsWith(PNG_DATA_URL);

export class DataUrlDecoder<I extends Bitmap> implements ImageDecoder<I> {
  constructor(
    private readonly fetch: Fetcher,
    private readonly createImageBitmap: BitmapMaker<I>,
  ) {}

  async decode(dataUrl: string): Promise<I> {
    if (!isPngDataUrl(dataUrl)) {
      throw new Error(NOT_PNG);
    }
    const response = await this.fetch(dataUrl);
    return this.createImageBitmap(await response.blob());
  }
}
