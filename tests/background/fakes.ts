import type { Mock } from "vitest";
import type {
  StitchLifecycle,
  StitchSession,
} from "../../src/background/offscreen-stitcher";
import type { PageDriver } from "../../src/background/page-client";
import type { ScreenshotIndicator } from "../../src/background/screenshot-indicator";

export type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<(...args: A) => R>
    : T[K];
};

export function fakeIndicator(): Mocked<ScreenshotIndicator> {
  return {
    showIdle: vi.fn(() => Promise.resolve()),
    showProgress: vi.fn(() => Promise.resolve()),
    showSaving: vi.fn(() => Promise.resolve()),
    showError: vi.fn(() => Promise.resolve()),
  };
}

export function fakeStitcher(): Mocked<StitchSession & StitchLifecycle> {
  return {
    begin: vi.fn(() => Promise.resolve()),
    add: vi.fn(() => Promise.resolve()),
    finish: vi.fn(() => Promise.resolve(["blob:1"])),
    close: vi.fn(() => Promise.resolve()),
  };
}

export function fakePage(): Mocked<PageDriver> {
  return {
    inject: vi.fn(() => Promise.resolve()),
    prepare: vi.fn(() =>
      Promise.resolve({
        viewportWidth: 1200,
        viewportHeight: 800,
        frameTop: 0,
        frameHeight: 800,
        frameLeft: 0,
        frameWidth: 1200,
        scrollHeight: 2000,
      }),
    ),
    scrollTo: vi.fn((_tabId: number, y: number) => Promise.resolve(y)),
    restore: vi.fn(() => Promise.resolve()),
  };
}
