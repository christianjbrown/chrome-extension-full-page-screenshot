import type { Rect } from "../shared/rect";

// The service worker's handle on the document that stitches the slices.
export interface StitchSession {
  begin(width: number, height: number): Promise<void>;
  add(dataUrl: string, rects: Rect[], scroll: number): Promise<void>;
  finish(): Promise<string[]>;
}

// Whoever starts a capture also ends it, whether or not it got as far as stitching.
export interface StitchLifecycle {
  close(): Promise<void>;
}
