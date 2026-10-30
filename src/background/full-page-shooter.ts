import type { CaptureTarget } from "./capturable-tabs";
import type { CapturePlanner } from "./capture-plan";
import type { StitchDriver } from "./offscreen-stitcher";
import type { PageDriver } from "./page-client";
import type { ScreenshotIndicator } from "./screenshot-indicator";
import type { VisibleTabCapture } from "./visible-tab-capture";

export interface Shooter {
  // Blob URLs of the finished PNGs, top to bottom.
  shoot(target: CaptureTarget): Promise<string[]>;
}

export interface FullPageShooterDependencies {
  page: PageDriver;
  planner: CapturePlanner;
  capture: VisibleTabCapture;
  stitcher: StitchDriver;
  indicator: ScreenshotIndicator;
}

// Scrolls the page a frame at a time, captures what is on screen, and hands
// each slice to the stitcher, then puts the page back how it was.
export class FullPageShooter implements Shooter {
  constructor(private readonly deps: FullPageShooterDependencies) {}

  async shoot(target: CaptureTarget): Promise<string[]> {
    await this.deps.page.inject(target.tabId);
    try {
      await this.slices(target);
    } finally {
      // A page that has gone away has nothing left to put back.
      await this.deps.page.restore(target.tabId).catch(() => undefined);
    }
    return this.deps.stitcher.finish();
  }

  private async slices(target: CaptureTarget): Promise<void> {
    const { page, capture, stitcher, indicator } = this.deps;
    const plan = this.deps.planner.plan(await page.prepare(target.tabId));
    await stitcher.begin(plan.width, plan.height);
    for (const [index, slice] of plan.slices.entries()) {
      await indicator.showProgress(index / plan.slices.length);
      const at = await page.scrollTo(target.tabId, slice.scroll, index > 0);
      const dataUrl = await capture.capture(target.windowId);
      await stitcher.add(dataUrl, slice.rects, at);
    }
  }
}
