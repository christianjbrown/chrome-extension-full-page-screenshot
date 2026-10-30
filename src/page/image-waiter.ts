// Waits for the images that have just scrolled into view, so a lazy-loaded
// image is captured drawn rather than blank. A slow image gets a little while
// and is then taken as it is, so one stuck download cannot stall the capture.
export interface ImageWaiter {
  // Whether there was anything to wait for.
  waitForVisible(): Promise<boolean>;
}

export interface PageImage {
  complete: boolean;
  getBoundingClientRect(): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  decode(): Promise<void>;
}

export interface DocumentImages {
  images: Iterable<unknown>;
}

export interface Viewport {
  innerWidth: number;
  innerHeight: number;
}

export type Timer = (callback: () => void, ms: number) => unknown;

export class VisibleImageWaiter implements ImageWaiter {
  constructor(
    private readonly document: DocumentImages,
    private readonly viewport: Viewport,
    private readonly timer: Timer,
    private readonly patienceMs: number,
  ) {}

  async waitForVisible(): Promise<boolean> {
    const loading = (Array.from(this.document.images) as PageImage[]).filter(
      (image) => !image.complete && this.onScreen(image),
    );
    if (loading.length === 0) {
      return false;
    }
    await Promise.race([
      // A broken image counts as finished: there is nothing more to wait for.
      Promise.all(
        loading.map((image) => image.decode().catch(() => undefined)),
      ),
      new Promise<void>((resolve) => {
        this.timer(resolve, this.patienceMs);
      }),
    ]);
    return true;
  }

  private onScreen(image: PageImage): boolean {
    const box = image.getBoundingClientRect();
    return (
      box.bottom > 0 &&
      box.top < this.viewport.innerHeight &&
      box.right > 0 &&
      box.left < this.viewport.innerWidth
    );
  }
}
