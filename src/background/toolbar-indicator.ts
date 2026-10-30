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

export class ToolbarIndicator implements ScreenshotIndicator {
  constructor(private readonly action: ToolbarAction) {}

  showIdle(): Promise<void> {
    return this.show({
      badge: "",
      colour: GREY,
      title: "Screenshot this whole page",
    });
  }

  showProgress(fraction: number): Promise<void> {
    return this.show({
      badge: `${String(Math.round(fraction * 100))}%`,
      colour: BLUE,
      title: "Capturing the page. Hold still.",
    });
  }

  showSaving(): Promise<void> {
    return this.show({
      badge: "...",
      colour: BLUE,
      title: "Saving the screenshot",
    });
  }

  showError(message: string): Promise<void> {
    return this.show({
      badge: "!",
      colour: RED,
      title: `Screenshot failed: ${message}`,
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
