// Drives the offscreen document's wiring through fake canvas and image APIs, end to end.
import { strictNative } from "../shared/strict-native";
type Listener = (
  message: unknown,
  sender: unknown,
  reply: (reply: unknown) => void,
) => boolean;

function installBrowser() {
  const listeners: Listener[] = [];
  const drawImage = vi.fn();
  vi.stubGlobal("chrome", {
    runtime: {
      id: "ext",
      onMessage: {
        addListener: (listener: Listener) => listeners.push(listener),
      },
    },
  });
  vi.stubGlobal(
    "fetch",
    strictNative(() =>
      Promise.resolve({ blob: () => Promise.resolve(new Blob()) }),
    ),
  );
  vi.stubGlobal(
    "createImageBitmap",
    strictNative(() =>
      Promise.resolve({ width: 2400, height: 1600, close: vi.fn() }),
    ),
  );
  vi.stubGlobal(
    "OffscreenCanvas",
    class {
      constructor(
        public width: number,
        public height: number,
      ) {}
      getContext() {
        return { drawImage };
      }
      convertToBlob() {
        return Promise.resolve(new Blob(["png"]));
      }
    },
  );
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:shot");
  return { listeners, drawImage };
}

function send(listeners: Listener[], message: unknown): Promise<unknown> {
  return new Promise((resolve) => {
    listeners[0]!(message, { id: "ext" }, resolve);
  });
}

describe("offscreen document", () => {
  it("stitches slices and answers with the PNG's blob URL", async () => {
    vi.resetModules();
    const { listeners, drawImage } = installBrowser();
    await import("../../src/offscreen/main");

    await expect(
      send(listeners, {
        target: "offscreen",
        type: "begin",
        width: 1200,
        height: 800,
      }),
    ).resolves.toEqual({ ok: true, value: undefined });
    await send(listeners, {
      target: "offscreen",
      type: "slice",
      dataUrl: "data:image/png;base64,AA",
      rects: [{ x: 0, y: 0, width: 1200, height: 800 }],
      scroll: 0,
    });
    await expect(
      send(listeners, { target: "offscreen", type: "finish" }),
    ).resolves.toEqual({ ok: true, value: ["blob:shot"] });
    expect(drawImage).toHaveBeenCalledTimes(1);
  });

  it("ignores slices with bad fields and foreign senders", async () => {
    vi.resetModules();
    const { listeners } = installBrowser();
    await import("../../src/offscreen/main");
    const slice = {
      target: "offscreen",
      type: "slice",
      dataUrl: "data:image/png;base64,AA",
      rects: [{ x: 0, y: 0, width: 1, height: 1 }],
      scroll: 0,
    };
    const ask = (message: unknown, id = "ext") =>
      listeners[0]!(message, { id }, vi.fn());

    expect(ask(slice, "evil")).toBe(false);
    expect(ask({ ...slice, rects: [{ x: 0 }] })).toBe(false);
    expect(ask({ ...slice, rects: [null] })).toBe(false);
    expect(ask({ ...slice, rects: "all" })).toBe(false);
    expect(ask({ ...slice, dataUrl: 4 })).toBe(false);
    expect(ask({ ...slice, scroll: Number.NaN })).toBe(false);
    expect(ask({ target: "offscreen", type: "begin", width: 1 })).toBe(false);
  });
});
