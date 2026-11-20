import { ClaimedFilenames } from "../../src/background/filename-claims";

describe("ClaimedFilenames", () => {
  it("suggests the claimed name for its own download, adding a number on a clash", () => {
    const claims = new ClaimedFilenames();
    const suggest = vi.fn();

    claims.claim("blob:shot", "2026-01-02-03-04-page.png");
    claims.determine({ url: "blob:shot" }, suggest);

    expect(suggest).toHaveBeenCalledWith({
      filename: "2026-01-02-03-04-page.png",
      conflictAction: "uniquify",
    });
  });

  it("leaves every other download's name to Chrome", () => {
    const claims = new ClaimedFilenames();
    const suggest = vi.fn();

    claims.claim("blob:shot", "page.png");
    claims.determine({ url: "https://example.com/file.zip" }, suggest);

    expect(suggest).toHaveBeenCalledWith();
  });

  it("forgets a name once it is released", () => {
    const claims = new ClaimedFilenames();
    const suggest = vi.fn();

    claims.claim("blob:shot", "page.png");
    claims.release("blob:shot");
    claims.determine({ url: "blob:shot" }, suggest);

    expect(suggest).toHaveBeenCalledWith();
  });
});
