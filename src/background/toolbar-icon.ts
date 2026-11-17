import type { ColourScheme } from "../shared/colour-scheme";

export interface IconAction {
  setIcon(details: { path: Record<string, string> }): Promise<void>;
}

const ICON_SIZES = [16, 32, 48, 128] as const;

const iconPath = (scheme: ColourScheme, size: number): string =>
  `icons/on-${scheme}/icon-${String(size)}.png`;

// An almost black icon on a light toolbar, an almost white one on a dark one.
export class ToolbarIcon {
  constructor(private readonly action: IconAction) {}

  show(scheme: ColourScheme): Promise<void> {
    return this.action.setIcon({
      path: Object.fromEntries(
        ICON_SIZES.map((size) => [String(size), iconPath(scheme, size)]),
      ),
    });
  }
}
