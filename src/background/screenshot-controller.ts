import type { BrowserTab, CaptureTargets } from "./capturable-tabs";
import type { ErrorExplainer } from "./chrome-errors";
import type { FileSaver } from "./file-saver";
import type { Shooter } from "./full-page-shooter";
import type { StitchLifecycle } from "./offscreen-stitcher";
import type { ScreenshotIndicator } from "./screenshot-indicator";
import type { ScreenshotNamer } from "./screenshot-namer";

export interface ScreenshotControllerDependencies {
  targets: CaptureTargets;
  shooter: Shooter;
  stitcher: StitchLifecycle;
  namer: ScreenshotNamer;
  saver: FileSaver;
  indicator: ScreenshotIndicator;
  errors: ErrorExplainer;
}

// One click, one screenshot: capture, save, and show how it went.
export class ScreenshotController {
  private busy = false;

  constructor(private readonly deps: ScreenshotControllerDependencies) {}

  async take(tab: BrowserTab): Promise<void> {
    // A second click while one is still being taken does nothing.
    if (this.busy) {
      return;
    }
    this.busy = true;
    try {
      await this.captureAndSave(tab);
      await this.settle(() => this.deps.indicator.showIdle());
    } catch (error) {
      await this.settle(() =>
        this.deps.indicator.showError(this.deps.errors.explain(error)),
      );
    } finally {
      this.busy = false;
    }
  }

  private async captureAndSave(tab: BrowserTab): Promise<void> {
    const target = await this.deps.targets.targetFor(tab);
    await this.deps.indicator.showProgress(0);
    const urls = await this.deps.shooter.shoot(target);
    await this.deps.indicator.showSaving();
    for (const file of this.deps.namer.name(target.title, urls)) {
      await this.deps.saver.save(file.url, file.filename);
    }
  }

  private async settle(show: () => Promise<void>): Promise<void> {
    await this.deps.stitcher.close().catch(() => undefined);
    await show();
  }
}
