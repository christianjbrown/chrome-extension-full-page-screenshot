import { IDLE_LOOK } from "../src/background/toolbar-looks";
import manifest from "../static/manifest.json";

describe("manifest", () => {
  // Chrome only fills in tab.title and tab.url on the clicked tab when the
  // extension has access to it, and activeTab is what grants that on a click.
  // Without it every file would get the fallback name, and
  // captureVisibleTab and the script injection would be refused too.
  it("asks for activeTab", () => {
    expect(manifest.permissions).toContain("activeTab");
  });

  // One offscreen document stitches the screenshot and reads the device's
  // colour scheme for the toolbar icon, and storage remembers the scheme Chrome
  // itself is in, which only a clicked tab reveals.
  it("asks for offscreen and storage", () => {
    expect(manifest.permissions).toContain("offscreen");
    expect(manifest.permissions).toContain("storage");
  });

  it("starts with the icon for a dark toolbar until the scheme is known", () => {
    expect(manifest.action.default_icon["16"]).toBe(
      "icons/on-dark/icon-16.png",
    );
    expect(manifest.icons["128"]).toBe("icons/on-dark/icon-128.png");
  });

  it("starts with the title the button goes back to when idle", () => {
    expect(manifest.action.default_title).toBe(IDLE_LOOK.title);
  });

  it("has no keyboard shortcut", () => {
    expect(manifest).not.toHaveProperty("commands");
  });
});
