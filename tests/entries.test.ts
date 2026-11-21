import {
  OFFSCREEN_DOCUMENT_PATH,
  PAGE_SCRIPT,
} from "../src/background/entries";
import entries from "../scripts/entries.json";
import manifest from "../static/manifest.json";
import offscreenHtml from "../static/offscreen.html?raw";

const BUNDLE = ".js";
const bundles = Object.keys(entries).map((name) => name + BUNDLE);

describe("build entries", () => {
  it("builds the page script the service worker injects", () => {
    expect(bundles).toContain(PAGE_SCRIPT);
  });

  it("ships the offscreen document, which loads a bundle the build writes", () => {
    const [, script] = /<script src="([^"]+)"/.exec(offscreenHtml) ?? [];

    expect(OFFSCREEN_DOCUMENT_PATH).toBe("offscreen.html");

    expect(bundles).toContain(script);
  });

  it("builds the service worker the manifest names", () => {
    expect(bundles).toContain(manifest.background.service_worker);
  });
});
