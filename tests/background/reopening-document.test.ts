import { ReopeningDocument } from "../../src/background/reopening-document";

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
  return { calls, inner, document: new ReopeningDocument(inner) };
}

describe("ReopeningDocument", () => {
  it("opens the document", async () => {
    const { calls, document } = setUp();

    await document.open();

    expect(calls).toEqual(["open"]);
  });

  it("opens the document again straight after closing it", async () => {
    const { calls, document } = setUp();

    await document.close();

    expect(calls).toEqual(["close", "open"]);
  });

  it("opens the document again even when closing it fails", async () => {
    const { calls, inner, document } = setUp();
    inner.close.mockRejectedValueOnce(new Error("Already gone"));

    await expect(document.close()).rejects.toThrow("Already gone");

    expect(calls).toEqual(["open"]);
  });
});
