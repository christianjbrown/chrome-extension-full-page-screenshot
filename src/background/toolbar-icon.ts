import type { ColourScheme } from "../shared/colour-scheme";
import { PNG_EXTENSION } from "../shared/png";

export interface IconAction {
  setIcon(details: { path: Record<string, string> }): Promise<void>;
}

// The sizes the manifest lists, in pixels.
const ICON_SIZES = [16, 32, 48, 128] as const;

const iconPath = (scheme: ColourScheme, size: number): string =>
  `icons/on-${scheme}/icon-${String(size)}${PNG_EXTENSION}`;

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
