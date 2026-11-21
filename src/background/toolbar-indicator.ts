import type { ScreenshotIndicator } from "./screenshot-indicator";

export interface ToolbarAction {
  setBadgeText(details: { text: string }): Promise<void>;
  setBadgeBackgroundColor(details: { color: string }): Promise<void>;
  setTitle(details: { title: string }): Promise<void>;
}

interface Look {
  badge: string;
  colour: string;
  title: string;
}

const RED = "#dc2626";
const BLUE = "#2563eb";
const GREY = "#5a5a60";

const NO_BADGE = "";
const SAVING_BADGE = "...";
const ERROR_BADGE = "!";
const PERCENT = 100;
const PERCENT_SIGN = "%";

// The button's tooltip. The idle one matches the manifest's default_title.
export const TITLES = {
  idle: "Screenshot this whole page",
  capturing: "Capturing the page. Hold still.",
  saving: "Saving the screenshot",
  failedBecause: "Screenshot failed: ",
} as const;

export class ToolbarIndicator implements ScreenshotIndicator {
  constructor(private readonly action: ToolbarAction) {}

  showIdle(): Promise<void> {
    return this.show({
      badge: NO_BADGE,
      colour: GREY,
      title: TITLES.idle,
    });
  }

  showProgress(fraction: number): Promise<void> {
    return this.show({
      badge: String(Math.round(fraction * PERCENT)) + PERCENT_SIGN,
      colour: BLUE,
      title: TITLES.capturing,
    });
  }

  showSaving(): Promise<void> {
    return this.show({
      badge: SAVING_BADGE,
      colour: BLUE,
      title: TITLES.saving,
    });
  }

  showError(message: string): Promise<void> {
    return this.show({
      badge: ERROR_BADGE,
      colour: RED,
      title: TITLES.failedBecause + message,
    });
  }

  private async show(look: Look): Promise<void> {
    await Promise.all([
      this.action.setBadgeText({ text: look.badge }),
      this.action.setBadgeBackgroundColor({ color: look.colour }),
      this.action.setTitle({ title: look.title }),
    ]);
  }
}
