import type { Bitmap } from "./surfaces";

// Turns a capture into an image that can be painted.
export interface ImageDecoder {
  decode(dataUrl: string): Promise<Bitmap>;
}
