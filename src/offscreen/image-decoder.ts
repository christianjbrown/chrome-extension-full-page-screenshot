import type { Bitmap } from "./surfaces";

export interface ImageDecoder {
  decode(dataUrl: string): Promise<Bitmap>;
}

export type Fetcher = (url: string) => Promise<{ blob(): Promise<Blob> }>;
export type BitmapMaker = (blob: Blob) => Promise<Bitmap>;

export class DataUrlDecoder implements ImageDecoder {
  constructor(
    private readonly fetch: Fetcher,
    private readonly createImageBitmap: BitmapMaker,
  ) {}

  async decode(dataUrl: string): Promise<Bitmap> {
    const response = await this.fetch(dataUrl);
    return this.createImageBitmap(await response.blob());
  }
}
