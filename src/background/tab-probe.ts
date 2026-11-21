// Runs inside the tab, not in the service worker: Chrome sends the function's
// own text across, so it can use nothing from this file, and reads the tab's
// own matchMedia. The query is passed in with it.
export function tabPrefersDark(query: string): boolean {
  return matchMedia(query).matches;
}
