import type { PageLayout, Rect } from "../shared/messages";

// Past this, in CSS pixels, the capture stops. It keeps a page that never ends
// from capturing for minutes.
export const MAX_PAGE_HEIGHT = 60000;

// A scroller shorter than this is not a pane worth stepping through, so the
// whole viewport is stepped instead.
const MIN_FRAME_HEIGHT = 100;
// More slices than this would take hours, so the capture is refused.
const MAX_SLICES = 1000;

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
function deepestScroll(layout: PageLayout): number {
  if (layout.frameHeight <= 0) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(
      layout.scrollHeight - layout.frameHeight,
      MAX_PAGE_HEIGHT - layout.viewportHeight,
    ),
  );
}

function scrollsDownTo(deepest: number, step: number): number[] {
  const scrolls = [0];
  for (let scroll = step; scroll < deepest; scroll += step) {
    scrolls.push(scroll);
    if (scrolls.length > MAX_SLICES) {
      throw new Error("This page is too long to capture");
    }
  }
  if (deepest > 0) {
    scrolls.push(deepest);
  }
  return scrolls;
}

function withRealFrame(layout: PageLayout): PageLayout {
  if (layout.frameHeight <= 0 || layout.frameHeight >= MIN_FRAME_HEIGHT) {
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
  plan(reported: PageLayout): CapturePlan {
    const layout = withRealFrame(reported);
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
    const deepest = deepestScroll(layout);
    const scrolls = scrollsDownTo(deepest, frameHeight);
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
