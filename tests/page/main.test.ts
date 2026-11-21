// Drives the injected page script's wiring through a fake page and chrome, end to end.
import { strictNative } from "../shared/strict-native";
import { fakeElement, fakeWindow } from "./fakes";

type Listener = (
  message: unknown,
  sender: unknown,
  reply: (reply: unknown) => void,
) => boolean;

// Stand-ins for the browser's own classes, which the script checks against.
class FakeDomElement {
  readonly kind = "element";
}
class FakeImageElement {
  readonly kind = "image";
}

const asInstanceOf = <T extends object>(
  kind: { prototype: object },
  value: T,
): T => Object.setPrototypeOf(value, kind.prototype) as T;

function installPage(rootHeight = 2400, inner: object[] = []) {
  const listeners: Listener[] = [];
  const window = fakeWindow(800);
  window.scrollY = 300;
  const root = asInstanceOf(
    FakeDomElement,
    fakeElement({ scrollHeight: rootHeight }),
  );
  const header = asInstanceOf(
    FakeDomElement,
    fakeElement({ position: "fixed" }),
  );
  vi.stubGlobal("Element", FakeDomElement);
  vi.stubGlobal("HTMLImageElement", FakeImageElement);
  vi.stubGlobal("chrome", {
    runtime: {
      id: "ext",
      onMessage: {
        addListener: vi.fn((listener: Listener) => listeners.push(listener)),
        removeListener: vi.fn((listener: Listener) => {
          listeners.splice(listeners.indexOf(listener), 1);
        }),
      },
    },
  });
  const picture = asInstanceOf(FakeImageElement, {
    complete: false,
    getBoundingClientRect: () => ({
      top: 10,
      bottom: 210,
      left: 0,
      right: 300,
    }),
    decode: vi.fn(() => Promise.resolve()),
  });
  vi.stubGlobal("document", {
    documentElement: root,
    // Text and an element with no inline style are not elements to look at.
    querySelectorAll: () => [
      root,
      header,
      "text",
      new FakeDomElement(),
      ...inner,
    ],
    images: [picture, "not an image"],
  });
  vi.stubGlobal("window", window);
  vi.stubGlobal(
    "getComputedStyle",
    strictNative((element: { look: unknown }) => element.look),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    strictNative((callback: () => void) => {
      callback();
    }),
  );
  vi.stubGlobal(
    "setTimeout",
    strictNative((callback: () => void) => {
      callback();
    }),
  );
  return { listeners, window, root, header, picture };
}

async function load() {
  vi.resetModules();
  await import("../../src/page/main");
}

function send(listeners: Listener[], message: unknown): Promise<unknown> {
  return new Promise((resolve) => {
    listeners[0]!(message, { id: "ext" }, resolve);
  });
}

describe("page script", () => {
  beforeEach(() => {
    delete (globalThis as Record<string, unknown>).__fullPageScreenshot;
  });

  it("prepares, scrolls and restores the page on request", async () => {
    const { listeners, window, root, header, picture } = installPage();
    await load();

    await expect(
      send(listeners, { target: "page", type: "prepare" }),
    ).resolves.toEqual({
      ok: true,
      value: {
        viewportWidth: 1200,
        viewportHeight: 800,
        frameTop: 0,
        frameHeight: 800,
        frameLeft: 0,
        frameWidth: 1200,
        scrollHeight: 2400,
      },
    });
    await expect(
      send(listeners, {
        target: "page",
        type: "scroll",
        y: 800,
        hideFixed: true,
      }),
    ).resolves.toEqual({ ok: true, value: 800 });
    expect(header.style.getPropertyValue("opacity")).toBe("0");
    expect(picture.decode).toHaveBeenCalled();
    await expect(
      send(listeners, { target: "page", type: "restore" }),
    ).resolves.toEqual({ ok: true, value: undefined });
    expect(window.scrollY).toBe(300);
    expect(root.style.values.size).toBe(0);
  });

  it("scrolls an inner pane when the page itself does not scroll", async () => {
    const pane = asInstanceOf(
      FakeDomElement,
      fakeElement({
        scrollHeight: 3000,
        clientHeight: 600,
        clientWidth: 900,
        overflowY: "auto",
      }),
    );
    const { listeners } = installPage(800, [pane]);
    await load();

    await expect(
      send(listeners, { target: "page", type: "prepare" }),
    ).resolves.toMatchObject({ ok: true, value: { scrollHeight: 3000 } });
    await expect(
      send(listeners, {
        target: "page",
        type: "scroll",
        y: 600,
        hideFixed: false,
      }),
    ).resolves.toEqual({ ok: true, value: 600 });
    expect(pane.scrollTop).toBe(600);
  });

  it("ignores messages for other contexts", async () => {
    const { listeners } = installPage();
    await load();

    expect(listeners[0]!({ target: "offscreen", type: "x" }, {}, vi.fn())).toBe(
      false,
    );
  });

  it("ignores a message from another extension or with bad fields", async () => {
    const { listeners } = installPage();
    await load();

    expect(
      listeners[0]!(
        { target: "page", type: "prepare" },
        { id: "evil" },
        vi.fn(),
      ),
    ).toBe(false);
    expect(
      listeners[0]!(
        { target: "page", type: "scroll", y: "9", hideFixed: true },
        { id: "ext" },
        vi.fn(),
      ),
    ).toBe(false);
  });

  it("retires the copy a previous click injected, putting its page back", async () => {
    const { listeners, window } = installPage();
    await load();
    await send(listeners, { target: "page", type: "prepare" });
    await send(listeners, {
      target: "page",
      type: "scroll",
      y: 1600,
      hideFixed: false,
    });

    await load();

    expect(listeners).toHaveLength(1);
    await vi.waitFor(() => {
      expect(window.scrollY).toBe(300);
    });
  });
});
