// Where the page scrolls, in CSS pixels. The frame is the part of the viewport
// that scrolls: all of it for a normal page, or one inner element's box when
// the page scrolls inside that instead, as Gmail's message pane does.
export interface PageLayout {
  viewportWidth: number;
  viewportHeight: number;
  frameTop: number;
  frameHeight: number;
  frameLeft: number;
  frameWidth: number;
  scrollHeight: number;
}
