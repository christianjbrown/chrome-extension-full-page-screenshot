import type { Rect } from "../shared/messages";

// What the service worker asks of the offscreen document, one need at a time.
export interface StitchStarter {
  begin(width: number, height: number): Promise<void>;
}

export interface SlicePainter {
  // Each box of the viewport capture belongs in the page at its own position
  // plus the scroll, all in CSS pixels.
  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void>;
}

export interface StitchFinisher {
  // Blob URLs of the finished PNGs, one per part, top to bottom.
  finish(): Promise<string[]>;
}
