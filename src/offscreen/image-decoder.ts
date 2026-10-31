import type { Bitmap } from "./surfaces";

export interface ImageDecoder {
  decode(dataUrl: string): Promise<Bitmap>;
}

export type Fetcher = (url: string) => Promise<{ blob(): Promise<Blob> }>;
export type BitmapMaker = (blob: Blob) => Promise<Bitmap>;

const PNG_DATA_URL = "data:image/png;base64,";

export class DataUrlDecoder implements ImageDecoder {
  constructor(
    private readonly fetch: Fetcher,
    private readonly createImageBitmap: BitmapMaker,
  ) {}

  async decode(dataUrl: string): Promise<Bitmap> {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith(PNG_DATA_URL)) {
      throw new Error("The capture is not a PNG data URL");
    }
    const response = await this.fetch(dataUrl);
    return this.createImageBitmap(await response.blob());
  }
}
