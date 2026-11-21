import type { PageLayout } from "../shared/page-layout";

// The service worker's handle on the script it injects into the page.
export interface PageDriver {
  inject(tabId: number): Promise<void>;
  prepare(tabId: number): Promise<PageLayout>;
  // Where the page actually ended up, which near the bottom can be short of y.
  scrollTo(tabId: number, y: number, hideFixed: boolean): Promise<number>;
  restore(tabId: number): Promise<void>;
}
