import { FinitePageValidator } from "../../src/background/page-validator";
import { PageClient } from "../../src/background/page-client";

function setUp(reply: unknown = { ok: true, value: 7 }) {
  const scripting = { executeScript: vi.fn().mockResolvedValue([]) };
  const tabs = { sendMessage: vi.fn().mockResolvedValue(reply) };
  return {
    scripting,
    tabs,
    page: new PageClient(scripting, tabs, "page.js", new FinitePageValidator()),
  };
}

const LAYOUT = {
  viewportWidth: 1000,
  viewportHeight: 800,
  frameTop: 0,
  frameHeight: 800,
  frameLeft: 0,
  frameWidth: 1000,
  scrollHeight: 3000,
};

describe("PageClient", () => {
  it("injects the page script into the tab", async () => {
    const { scripting, page } = setUp();

    await page.inject(4);

    expect(scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 4 },
      files: ["page.js"],
    });
  });

  it.each([
    {
      call: (page: PageClient) => page.prepare(4).then(() => 7),
      message: { target: "page", type: "prepare" },
      reply: { ok: true, value: LAYOUT },
    },
    {
      call: (page: PageClient) => page.scrollTo(4, 900, true),
      message: { target: "page", type: "scroll", y: 900, hideFixed: true },
      reply: { ok: true, value: 7 },
    },
    {
      call: (page: PageClient) => page.restore(4).then(() => 7),
      message: { target: "page", type: "restore" },
      reply: { ok: true, value: undefined },
    },
  ])(
    "sends $message.type and returns the page's answer",
    async ({ call, message, reply }) => {
      const { tabs, page } = setUp(reply);

      await expect(call(page)).resolves.toBe(7);
      expect(tabs.sendMessage).toHaveBeenCalledWith(4, message);
    },
  );

  it("passes on a sound layout and scroll position", async () => {
    const { page } = setUp({ ok: true, value: LAYOUT });
    await expect(page.prepare(4)).resolves.toEqual(LAYOUT);

    const { page: scroller } = setUp({ ok: true, value: 12.5 });
    await expect(scroller.scrollTo(4, 0, false)).resolves.toBe(12.5);
  });

  it.each([
    { viewportWidth: 0 },
    { viewportWidth: -5 },
    { viewportHeight: Number.NaN },
    { scrollHeight: Infinity },
    { frameHeight: -1 },
    { frameTop: "2" },
    { frameWidth: undefined },
  ])("refuses a layout with %o", async (bad) => {
    const { page } = setUp({ ok: true, value: { ...LAYOUT, ...bad } });

    await expect(page.prepare(4)).rejects.toThrow("unusable layout");
  });

  it.each([null, "layout", 7])("refuses %o as a layout", async (value) => {
    const { page } = setUp({ ok: true, value });

    await expect(page.prepare(4)).rejects.toThrow("unusable layout");
  });

  it.each([Number.NaN, Infinity, "5", undefined])(
    "refuses %o as a scroll position",
    async (value) => {
      const { page } = setUp({ ok: true, value });

      await expect(page.scrollTo(4, 0, false)).rejects.toThrow(
        "unusable scroll position",
      );
    },
  );

  it("throws what went wrong in the page", async () => {
    const { page } = setUp({ ok: false, error: "not prepared" });

    await expect(page.scrollTo(4, 0, false)).rejects.toThrow("not prepared");
  });

  it("says so when the page does not answer", async () => {
    const { tabs, page } = setUp();
    tabs.sendMessage.mockResolvedValueOnce(undefined);

    await expect(page.prepare(4)).rejects.toThrow("The page did not answer");
  });
});
