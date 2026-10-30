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
    listeners[0]!(message, {}, resolve);
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
      from: 0,
      to: 800,
      y: 0,
    });
    await expect(
      send(listeners, { target: "offscreen", type: "finish" }),
    ).resolves.toEqual({ ok: true, value: ["blob:shot"] });
    expect(drawImage).toHaveBeenCalledTimes(1);
  });
});
