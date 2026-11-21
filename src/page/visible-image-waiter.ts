import type { Timer } from "../shared/timer";
import type { ImageWaiter } from "./image-waiter";
import type { Viewport } from "./viewport";

// Where an image sits in the viewport, in CSS pixels.
interface ImageBox {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageImage {
  complete: boolean;
  getBoundingClientRect(): ImageBox;
  decode(): Promise<void>;
}

export interface DocumentImages {
  images: Iterable<unknown>;
}

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
    return this.withinRows(box) && this.withinColumns(box);
  }

  private withinRows(box: ImageBox): boolean {
    return box.bottom > 0 && box.top < this.viewport.innerHeight;
  }

  private withinColumns(box: ImageBox): boolean {
    return box.right > 0 && box.left < this.viewport.innerWidth;
  }
}
