import { OffscreenStitcher } from "../../src/background/offscreen-stitcher";

function setUp(
  open: boolean,
  reply: unknown = { ok: true, value: ["blob:1"] },
) {
  const documents = {
    createDocument: vi.fn().mockResolvedValue(undefined),
    closeDocument: vi.fn().mockResolvedValue(undefined),
  };
  const contexts = {
    getContexts: vi.fn(() => Promise.resolve(open ? [{}] : [])),
    getURL: (path: string) => `chrome-extension://id/${path}`,
  };
  const messages = { send: vi.fn().mockResolvedValue(reply) };
  return {
    documents,
    contexts,
    messages,
    stitcher: new OffscreenStitcher(
      documents,
      contexts,
      messages,
      "offscreen.html",
    ),
  };
}

describe("OffscreenStitcher", () => {
  it("opens the offscreen document for blobs, then begins", async () => {
    const { documents, contexts, messages, stitcher } = setUp(false);

    await stitcher.begin(1200, 3000);

    expect(contexts.getContexts).toHaveBeenCalledWith({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: ["chrome-extension://id/offscreen.html"],
    });
    expect(documents.createDocument).toHaveBeenCalledWith({
      url: "offscreen.html",
      reasons: ["BLOBS"],
      justification: "Stitches the screenshot and hands it to downloads",
    });
    expect(messages.send).toHaveBeenCalledWith({
      target: "offscreen",
      type: "begin",
      width: 1200,
      height: 3000,
    });
  });

  it("reuses a document that is already open", async () => {
    const { documents, stitcher } = setUp(true);

    await stitcher.begin(1200, 3000);

    expect(documents.createDocument).not.toHaveBeenCalled();
  });

  it("sends each slice", async () => {
    const { messages, stitcher } = setUp(true);

    const rects = [{ x: 250, y: 100, width: 900, height: 800 }];

    await stitcher.add("data:x", rects, 1700);

    expect(messages.send).toHaveBeenCalledWith({
      target: "offscreen",
      type: "slice",
      dataUrl: "data:x",
      rects,
      scroll: 1700,
    });
  });

  it("finishes with the blob URLs", async () => {
    const { messages, stitcher } = setUp(true);

    await expect(stitcher.finish()).resolves.toEqual(["blob:1"]);
    expect(messages.send).toHaveBeenCalledWith({
      target: "offscreen",
      type: "finish",
    });
  });

  it("throws the stitcher's error", async () => {
    const { stitcher } = setUp(true, { ok: false, error: "too big" });

    await expect(stitcher.finish()).rejects.toThrow("too big");
  });

  it("says so when the stitcher does not answer", async () => {
    const { messages, stitcher } = setUp(true);
    messages.send.mockResolvedValueOnce(undefined);

    await expect(stitcher.finish()).rejects.toThrow(
      "The stitcher did not answer",
    );
  });

  it.each([
    { open: true, closes: 1 },
    { open: false, closes: 0 },
  ])(
    "closes the document only when it is open ($open)",
    async ({ open, closes }) => {
      const { documents, stitcher } = setUp(open);

      await stitcher.close();

      expect(documents.closeDocument).toHaveBeenCalledTimes(closes);
    },
  );
});
