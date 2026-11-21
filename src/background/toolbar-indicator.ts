import type { ScreenshotIndicator, Stage } from "./screenshot-indicator";

export interface ToolbarAction {
  setBadgeText(details: { text: string }): Promise<void>;
  setBadgeBackgroundColor(details: { color: string }): Promise<void>;
  setTitle(details: { title: string }): Promise<void>;
}

// Puts the button in the look of whichever stage it is shown.
export class ToolbarIndicator implements ScreenshotIndicator {
  constructor(private readonly action: ToolbarAction) {}

  async show<D>(stage: Stage<D>, detail: D): Promise<void> {
    const look = stage.lookFor(detail);
    await Promise.all([
      this.action.setBadgeText({ text: look.badge }),
      this.action.setBadgeBackgroundColor({ color: look.colour }),
      this.action.setTitle({ title: look.title }),
    ]);
  }
}
