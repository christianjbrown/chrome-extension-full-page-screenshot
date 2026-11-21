import type { PageLayout } from "../shared/page-layout";
import type { Rect } from "../shared/rect";

// One scroll position and what to take from the viewport there.
interface PlannedSlice {
  scroll: number;
  // The parts of the viewport this slice contributes. Each belongs in the
  // page at its own position plus where the page has scrolled to.
  rects: Rect[];
}

// The whole picture's size, and the slices that fill it, top to bottom.
export interface CapturePlan {
  width: number;
  height: number;
  slices: PlannedSlice[];
}

// Works out how to step down a page from the layout it reports.
export interface CapturePlanner {
  plan(layout: PageLayout): CapturePlan;
}
