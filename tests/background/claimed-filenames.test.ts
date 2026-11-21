import { ClaimedFilenames } from "../../src/background/claimed-filenames";

const NO_OPINION = { filename: "", conflictAction: "uniquify" };

function setUp() {
  const listening = { hold: vi.fn(), release: vi.fn() };
  return { listening, claims: new ClaimedFilenames(listening) };
}

describe("ClaimedFilenames", () => {
  it("suggests the claimed name for its own download, adding a number on a clash", () => {
    const { claims } = setUp();
    const suggest = vi.fn();

    claims.claim("blob:shot", "2026-01-02-03-04-page.png");
    claims.determine({ url: "blob:shot" }, suggest);

    expect(suggest).toHaveBeenCalledWith({
      filename: "2026-01-02-03-04-page.png",
      conflictAction: "uniquify",
    });
  });

  it("gives every other download the answer Chrome reads as no opinion", () => {
    const { claims } = setUp();
    const suggest = vi.fn();

    claims.claim("blob:shot", "page.png");
    claims.determine({ url: "https://example.com/file.zip" }, suggest);

    expect(suggest).toHaveBeenCalledWith(NO_OPINION);
  });

  it("forgets a name once it is released", () => {
    const { claims } = setUp();
    const suggest = vi.fn();

    claims.claim("blob:shot", "page.png");
    claims.release("blob:shot");
    claims.determine({ url: "blob:shot" }, suggest);

    expect(suggest).toHaveBeenCalledWith(NO_OPINION);
  });

  it("holds the listener for each claim and lets go when it is released", () => {
    const { claims, listening } = setUp();

    claims.claim("blob:one", "one.png");
    claims.claim("blob:two", "two.png");
    expect(listening.hold).toHaveBeenCalledTimes(2);

    claims.release("blob:one");
    expect(listening.release).toHaveBeenCalledTimes(1);
  });

  it("lets go of the listener once its own download is named", () => {
    const { claims, listening } = setUp();
    const suggest = vi.fn();

    claims.claim("blob:shot", "page.png");
    claims.determine({ url: "blob:shot" }, suggest);

    expect(listening.release).toHaveBeenCalledTimes(1);
    expect(suggest.mock.invocationCallOrder[0]).toBeLessThan(
      listening.release.mock.invocationCallOrder[0]!,
    );
  });

  it("lets go once per claim, however often it is released", () => {
    const { claims, listening } = setUp();

    claims.claim("blob:shot", "page.png");
    claims.determine({ url: "blob:shot" }, vi.fn());
    claims.release("blob:shot");
    claims.release("blob:never-claimed");

    expect(listening.release).toHaveBeenCalledTimes(1);
  });

  it("holds once when the same download is claimed twice", () => {
    const { claims, listening } = setUp();

    claims.claim("blob:shot", "old.png");
    claims.claim("blob:shot", "new.png");

    expect(listening.hold).toHaveBeenCalledTimes(1);
  });

  it("leaves the listener alone for someone else's download", () => {
    const { claims, listening } = setUp();

    claims.claim("blob:shot", "page.png");
    claims.determine({ url: "https://example.com/file.zip" }, vi.fn());

    expect(listening.release).not.toHaveBeenCalled();
  });
});
