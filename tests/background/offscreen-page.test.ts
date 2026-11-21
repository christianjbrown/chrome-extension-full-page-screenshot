import { SerialQueue } from "../../src/shared/serial-queue";
import {
  OFFSCREEN_JUSTIFICATION,
  OffscreenPage,
} from "../../src/background/offscreen-page";

function setUp(open = false) {
  const state = { open };
  const documents = {
    createDocument: vi.fn(() => {
      if (state.open) {
        return Promise.reject(new Error("Only one offscreen document"));
      }
      state.open = true;
      return Promise.resolve();
    }),
    closeDocument: vi.fn(() => {
      state.open = false;
      return Promise.resolve();
    }),
  };
  const contexts = {
    getContexts: vi.fn(() => Promise.resolve(state.open ? [{}] : [])),
    getURL: (path: string) => `chrome-extension://id/${path}`,
  };
  return {
    state,
    documents,
    contexts,
    page: new OffscreenPage(
      documents,
      contexts,
      new SerialQueue(),
      "offscreen.html",
    ),
  };
}

describe("OffscreenPage", () => {
  it("creates the document for both of its jobs", async () => {
    const { documents, contexts, page } = setUp();

    await page.open();

    expect(contexts.getContexts).toHaveBeenCalledWith({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: ["chrome-extension://id/offscreen.html"],
    });
    expect(documents.createDocument).toHaveBeenCalledExactlyOnceWith({
      url: "offscreen.html",
      reasons: ["BLOBS", "MATCH_MEDIA"],
      justification: OFFSCREEN_JUSTIFICATION,
    });
    expect(OFFSCREEN_JUSTIFICATION).toMatch(/screenshot.*colour scheme/);
  });

  it("leaves a document that is already open alone", async () => {
    const { documents, page } = setUp(true);

    await page.open();

    expect(documents.createDocument).not.toHaveBeenCalled();
  });

  it("creates one document when several events ask at once", async () => {
    const { documents, page } = setUp();

    await Promise.all([page.open(), page.open(), page.open()]);

    expect(documents.createDocument).toHaveBeenCalledTimes(1);
  });

  it.each([
    { open: true, closes: 1 },
    { open: false, closes: 0 },
  ])(
    "closes the document only when it is open ($open)",
    async ({ open, closes }) => {
      const { documents, page } = setUp(open);

      await page.close();

      expect(documents.closeDocument).toHaveBeenCalledTimes(closes);
    },
  );

  it("opens a new document after a close", async () => {
    const { state, documents, page } = setUp();

    await page.open();
    await page.close();
    await page.open();

    expect(documents.createDocument).toHaveBeenCalledTimes(2);
    expect(state.open).toBe(true);
  });

  it("takes an open, a close and an open asked at once in that order", async () => {
    const { state, documents, page } = setUp();

    await Promise.all([page.open(), page.close(), page.open()]);

    expect(documents.createDocument).toHaveBeenCalledTimes(2);
    expect(documents.closeDocument).toHaveBeenCalledTimes(1);
    expect(state.open).toBe(true);
  });

  it("reports a failure and still takes the next turn", async () => {
    const { documents, page } = setUp();
    documents.createDocument.mockRejectedValueOnce(new Error("No luck"));

    await expect(page.open()).rejects.toThrow("No luck");
    await page.open();

    expect(documents.createDocument).toHaveBeenCalledTimes(2);
  });
});
