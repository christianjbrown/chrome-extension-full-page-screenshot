import { PageClient } from "../../src/background/page-client";

function setUp(reply: unknown = { ok: true, value: 7 }) {
  const scripting = { executeScript: vi.fn().mockResolvedValue([]) };
  const tabs = { sendMessage: vi.fn().mockResolvedValue(reply) };
  return { scripting, tabs, page: new PageClient(scripting, tabs, "page.js") };
}

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
      call: (page: PageClient) => page.prepare(4),
      message: { target: "page", type: "prepare" },
    },
    {
      call: (page: PageClient) => page.scrollTo(4, 900, true),
      message: { target: "page", type: "scroll", y: 900, hideFixed: true },
    },
    {
      call: (page: PageClient) => page.restore(4),
      message: { target: "page", type: "restore" },
    },
  ])(
    "sends $message.type and returns the page's answer",
    async ({ call, message }) => {
      const { tabs, page } = setUp();

      await expect(call(page)).resolves.toBe(7);
      expect(tabs.sendMessage).toHaveBeenCalledWith(4, message);
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
