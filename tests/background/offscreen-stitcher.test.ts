import { ReplyUnwrapper } from "../../src/shared/replies";
import { OffscreenStitcher } from "../../src/background/offscreen-stitcher";

function setUp(reply: unknown = { ok: true, value: ["blob:1"] }) {
  const calls: string[] = [];
  const document = {
    open: vi.fn(() => {
      calls.push("open");
      return Promise.resolve();
    }),
    renew: vi.fn().mockResolvedValue(undefined),
  };
  const messages = {
    send: vi.fn((message: { type: string }) => {
      calls.push(message.type);
      return Promise.resolve(reply);
    }),
  };
  return {
    calls,
    document,
    messages,
    stitcher: new OffscreenStitcher(document, messages, new ReplyUnwrapper()),
  };
}

describe("OffscreenStitcher", () => {
  it("makes sure the offscreen document is open, then begins", async () => {
    const { calls, messages, stitcher } = setUp();

    await stitcher.begin(1200, 3000);

    expect(calls).toEqual(["open", "begin"]);
    expect(messages.send).toHaveBeenCalledWith({
      target: "offscreen",
      type: "begin",
      width: 1200,
      height: 3000,
    });
  });

  it("sends each slice", async () => {
    const { messages, stitcher } = setUp();

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
    const { messages, stitcher } = setUp();

    await expect(stitcher.finish()).resolves.toEqual(["blob:1"]);
    expect(messages.send).toHaveBeenCalledWith({
      target: "offscreen",
      type: "finish",
    });
  });

  it("throws the stitcher's error", async () => {
    const { stitcher } = setUp({ ok: false, error: "too big" });

    await expect(stitcher.finish()).rejects.toThrow("too big");
  });

  it("says so when the stitcher does not answer", async () => {
    const { messages, stitcher } = setUp();
    messages.send.mockResolvedValueOnce(undefined);

    await expect(stitcher.finish()).rejects.toThrow(
      "The stitcher did not answer",
    );
  });

  it("renews the document, so that its blob URLs die", async () => {
    const { document, stitcher } = setUp();

    await stitcher.close();

    expect(document.renew).toHaveBeenCalledTimes(1);
  });
});
