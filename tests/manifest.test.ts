import manifest from "../static/manifest.json";

describe("manifest", () => {
  // Chrome only fills in tab.title and tab.url on the clicked tab when the
  // extension has access to it, and activeTab is what grants that on a click
  // or the shortcut. Without it every file would get the fallback name, and
  // captureVisibleTab and the script injection would be refused too.
  it("asks for activeTab", () => {
    expect(manifest.permissions).toContain("activeTab");
  });
});
