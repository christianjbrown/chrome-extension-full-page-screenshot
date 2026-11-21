import { PNG_TYPE } from "../shared/png";
import type { ImageDecoder } from "./image-decoder";
import type { Bitmap } from "./surfaces";

export type Fetcher = (url: string) => Promise<{ blob(): Promise<Blob> }>;
export type BitmapMaker = (blob: Blob) => Promise<Bitmap>;

const PNG_DATA_URL = `data:${PNG_TYPE};base64,`;
const NOT_PNG = "The capture is not a PNG data URL";

export class DataUrlDecoder implements ImageDecoder {
  constructor(
    private readonly fetch: Fetcher,
    private readonly createImageBitmap: BitmapMaker,
  ) {}

  async decode(dataUrl: string): Promise<Bitmap> {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith(PNG_DATA_URL)) {
      throw new Error(NOT_PNG);
    }
    const response = await this.fetch(dataUrl);
    return this.createImageBitmap(await response.blob());
  }
}
