import type { Timer } from "../shared/timer";
import type { ImageWaiter } from "./image-waiter";
import type { ImageBox, PageImage, PageImages } from "./page-images";
import type { Viewport } from "./viewport";

export class VisibleImageWaiter implements ImageWaiter {
  constructor(
    private readonly images: PageImages,
    private readonly viewport: Viewport,
    private readonly timer: Timer,
    private readonly patienceMs: number,
  ) {}

  async waitForVisible(): Promise<boolean> {
    const loading = this.images
      .all()
      .filter((image) => !image.complete && this.onScreen(image));
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
