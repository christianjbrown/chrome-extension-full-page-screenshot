import type { PageLayout, Rect } from "../shared/messages";

// How far a capture may go. The config says why each one is there.
export interface PlanLimits {
  maxPageHeight: number;
  minFrameHeight: number;
  maxSlices: number;
}

const TOO_LONG = "This page is too long to capture";

interface PlannedSlice {
  scroll: number;
  // The parts of the viewport this slice contributes. Each belongs in the
  // page at its own position plus where the page has scrolled to.
  rects: Rect[];
}

export interface CapturePlan {
  width: number;
  height: number;
  slices: PlannedSlice[];
}

export interface CapturePlanner {
  plan(layout: PageLayout): CapturePlan;
}

// A frame scrolled entirely off screen has nothing to show, so it is not scrolled.
function deepestScroll(layout: PageLayout, maxPageHeight: number): number {
  if (layout.frameHeight <= 0) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(
      layout.scrollHeight - layout.frameHeight,
      maxPageHeight - layout.viewportHeight,
    ),
  );
}

function scrollsDownTo(
  deepest: number,
  step: number,
  maxSlices: number,
): number[] {
  const scrolls = [0];
  for (let scroll = step; scroll < deepest; scroll += step) {
    scrolls.push(scroll);
    if (scrolls.length > maxSlices) {
      throw new Error(TOO_LONG);
    }
  }
  if (deepest > 0) {
    scrolls.push(deepest);
  }
  return scrolls;
}

function withRealFrame(layout: PageLayout, minFrameHeight: number): PageLayout {
  if (layout.frameHeight <= 0 || layout.frameHeight >= minFrameHeight) {
    return layout;
  }
  return {
    ...layout,
    frameTop: 0,
    frameHeight: layout.viewportHeight,
    frameLeft: 0,
    frameWidth: layout.viewportWidth,
  };
}

// One slice per frame's worth of scrolling. The first slice takes the whole
// viewport down to the bottom of the frame, so whatever sits beside or above
// the frame (Gmail's navigation, say) shows once. Later slices take only the
// frame's own box, the last one adds only the rows the one before it had not
// covered, and it also brings whatever sits below the frame.
export class SlicePlanner implements CapturePlanner {
  constructor(private readonly limits: PlanLimits) {}

  plan(reported: PageLayout): CapturePlan {
    const { maxPageHeight, minFrameHeight, maxSlices } = this.limits;
    const layout = withRealFrame(reported, minFrameHeight);
    const { viewportWidth, viewportHeight, frameTop, frameHeight } = layout;
    const frameBottom = frameTop + frameHeight;
    const across = (top: number, bottom: number): Rect => ({
      x: 0,
      y: top,
      width: viewportWidth,
      height: bottom - top,
    });
    const framed = (top: number): Rect => ({
      x: layout.frameLeft,
      y: top,
      width: layout.frameWidth,
      height: frameBottom - top,
    });
    const deepest = deepestScroll(layout, maxPageHeight);
    const scrolls = scrollsDownTo(deepest, frameHeight, maxSlices);
    let coveredTo = 0;
    const slices = scrolls.map((scroll, index) => {
      const rects = [
        index === 0
          ? across(0, frameBottom)
          : framed(frameTop + coveredTo - scroll),
      ];
      if (index === scrolls.length - 1) {
        rects.push(across(frameBottom, viewportHeight));
      }
      coveredTo = scroll + frameHeight;
      return { scroll, rects: rects.filter((rect) => rect.height > 0) };
    });
    return { width: viewportWidth, height: viewportHeight + deepest, slices };
  }
}
