import type { PageLayout } from "../shared/messages";

// Past this, in CSS pixels, the capture stops. It keeps a page that never ends
// from capturing for minutes.
export const MAX_PAGE_HEIGHT = 60000;

interface PlannedSlice {
  scroll: number;
  // The viewport rows this slice contributes, in CSS pixels.
  from: number;
  to: number;
}

export interface CapturePlan {
  width: number;
  height: number;
  slices: PlannedSlice[];
}

export interface CapturePlanner {
  plan(layout: PageLayout): CapturePlan;
}

// One slice per frame's worth of scrolling. The first slice also brings what
// sits above the frame, the last one what sits below it, and the last only
// adds the rows the one before it had not already covered.
export class SlicePlanner implements CapturePlanner {
  plan(layout: PageLayout): CapturePlan {
    const { viewportHeight, frameTop, frameHeight } = layout;
    const frameBottom = frameTop + frameHeight;
    // A frame scrolled entirely off screen has nothing to show, so it is not scrolled.
    const deepest =
      frameHeight > 0
        ? Math.max(
            0,
            Math.min(
              layout.scrollHeight - frameHeight,
              MAX_PAGE_HEIGHT - viewportHeight,
            ),
          )
        : 0;
    const scrolls = [0];
    for (let scroll = frameHeight; scroll < deepest; scroll += frameHeight) {
      scrolls.push(scroll);
    }
    if (deepest > 0) {
      scrolls.push(deepest);
    }
    let coveredTo = 0;
    const slices = scrolls.map((scroll, index) => {
      const from = index === 0 ? 0 : frameTop + coveredTo - scroll;
      const to = index === scrolls.length - 1 ? viewportHeight : frameBottom;
      coveredTo = scroll + frameHeight;
      return { scroll, from, to };
    });
    return {
      width: layout.viewportWidth,
      height: viewportHeight + deepest,
      slices,
    };
  }
}
