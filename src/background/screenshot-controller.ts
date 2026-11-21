import type { BrowserTab, CaptureTargets } from "./capture-target";
import type { ErrorExplainer } from "./error-explainer";
import type { FileSaver } from "./file-saver";
import type { Shooter } from "./shooter";
import type { StitchLifecycle } from "./stitch-session";
import type {
  ScreenshotIndicator,
  ScreenshotStages,
} from "./screenshot-indicator";
import type { ScreenshotNamer } from "./screenshot-namer";

export interface ScreenshotControllerDependencies {
  targets: CaptureTargets;
  shooter: Shooter;
  stitcher: StitchLifecycle;
  namer: ScreenshotNamer;
  saver: FileSaver;
  indicator: ScreenshotIndicator;
  stages: ScreenshotStages;
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
      await this.attempt(tab);
    } finally {
      this.busy = false;
    }
  }

  // Shows how it went either way.
  private async attempt(tab: BrowserTab): Promise<void> {
    try {
      await this.captureAndSave(tab);
      await this.settle(() =>
        this.deps.indicator.show(this.deps.stages.idle, undefined),
      );
    } catch (error) {
      await this.settle(() =>
        this.deps.indicator.show(
          this.deps.stages.failed,
          this.deps.errors.explain(error),
        ),
      );
    }
  }

  private async captureAndSave(tab: BrowserTab): Promise<void> {
    const target = await this.deps.targets.targetFor(tab);
    const { indicator, stages } = this.deps;
    await indicator.show(stages.progress, 0);
    const urls = await this.deps.shooter.shoot(target);
    await indicator.show(stages.saving, undefined);
    for (const file of this.deps.namer.name(target.title, urls)) {
      await this.deps.saver.save(file.url, file.filename);
    }
  }

  private async settle(show: () => Promise<void>): Promise<void> {
    await this.deps.stitcher.close().catch(() => undefined);
    await show();
  }
}
