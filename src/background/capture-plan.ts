import type { PageLayout, Rect } from "../shared/messages";
import type { CapturePlan, CapturePlanner } from "./capture-planner";

// How far a capture may go. The config says why each one is there.
export interface PlanLimits {
  maxPageHeight: number;
  minFrameHeight: number;
  maxSlices: number;
}

const TOO_LONG = "This page is too long to capture";

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

function checkCount(scrolls: number[], maxSlices: number): void {
  if (scrolls.length > maxSlices) {
    throw new Error(TOO_LONG);
  }
}

// The top, then one step at a time while the deepest scroll is still below.
function stepsAbove(
  deepest: number,
  step: number,
  maxSlices: number,
): number[] {
  const scrolls = [0];
  for (let scroll = step; scroll < deepest; scroll += step) {
    scrolls.push(scroll);
    checkCount(scrolls, maxSlices);
  }
  return scrolls;
}

// Always starts at the top, and ends at the deepest scroll when there is one.
function scrollsDownTo(
  deepest: number,
  step: number,
  maxSlices: number,
): number[] {
  const scrolls = stepsAbove(deepest, step, maxSlices);
  return deepest > 0 ? [...scrolls, deepest] : scrolls;
}

// A frame scrolled off screen, or tall enough to step by, is used as it is.
const isUsableFrame = (frameHeight: number, minFrameHeight: number): boolean =>
  frameHeight <= 0 || frameHeight >= minFrameHeight;

const hasHeight = (rect: Rect): boolean => rect.height > 0;

function withRealFrame(layout: PageLayout, minFrameHeight: number): PageLayout {
  if (isUsableFrame(layout.frameHeight, minFrameHeight)) {
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
    // The first scroll is always the top, which takes the whole viewport.
    const [, ...later] = scrollsDownTo(deepest, frameHeight, maxSlices);
    let coveredTo = frameHeight;
    const tops = [
      { scroll: 0, rects: [across(0, frameBottom)] },
      ...later.map((scroll) => {
        const rects = [framed(frameTop + coveredTo - scroll)];
        coveredTo = scroll + frameHeight;
        return { scroll, rects };
      }),
    ];
    const last = tops.length - 1;
    const below = across(frameBottom, viewportHeight);
    const slices = tops.map(({ scroll, rects }, index) => ({
      scroll,
      rects: (index === last ? [...rects, below] : rects).filter(hasHeight),
    }));
    return { width: viewportWidth, height: viewportHeight + deepest, slices };
  }
}
