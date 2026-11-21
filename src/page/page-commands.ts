import type { PageLayout } from "../shared/page-layout";

// What the service worker asks of the page while it captures, one need at a
// time. Putting the page back is a Restorable.
export interface PagePreparer {
  prepare(): Promise<PageLayout>;
}

export interface PageScroller {
  // Where the page actually ended up, which near the bottom can be short of y.
  scrollTo(y: number, hideFixed: boolean): Promise<number>;
}
