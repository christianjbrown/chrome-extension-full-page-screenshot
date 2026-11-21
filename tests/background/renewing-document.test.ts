import { RenewingDocument } from "../../src/background/renewing-document";

function setUp() {
  const calls: string[] = [];
  const inner = {
    open: vi.fn(() => {
      calls.push("open");
      return Promise.resolve();
    }),
    close: vi.fn(() => {
      calls.push("close");
      return Promise.resolve();
    }),
  };
  return { calls, inner, document: new RenewingDocument(inner) };
}

describe("RenewingDocument", () => {
  it("opens the document", async () => {
    const { calls, document } = setUp();

    await document.open();

    expect(calls).toEqual(["open"]);
  });

  it("renews the document by closing it and opening it straight back up", async () => {
    const { calls, document } = setUp();

    await document.renew();

    expect(calls).toEqual(["close", "open"]);
  });

  it("opens the document again even when closing the old one fails", async () => {
    const { calls, inner, document } = setUp();
    inner.close.mockRejectedValueOnce(new Error("Already gone"));

    await expect(document.renew()).rejects.toThrow("Already gone");

    expect(calls).toEqual(["open"]);
  });
});
