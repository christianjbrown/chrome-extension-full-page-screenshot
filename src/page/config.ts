// Settings for the page script. Only its entry point reads them, and hands
// each one to the part that needs it.
export interface PageConfig {
  // How long to let scroll handlers and lazy content catch up after a scroll.
  settleMs: number;
  // How long a slow image gets before it is captured as it is.
  imagePatienceMs: number;
}

export const PAGE_CONFIG: PageConfig = {
  settleMs: 100,
  imagePatienceMs: 2000,
};
