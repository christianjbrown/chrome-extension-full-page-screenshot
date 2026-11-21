import { DownloadCompletion } from "../../src/background/download-completion";
import { DownloadSaver } from "../../src/background/download-saver";
import { ClaimedFilenames } from "../../src/background/claimed-filenames";
import { FilenameListening } from "../../src/background/filename-listening";

type Listener = (delta: {
  id: number;
  state?: { current?: string };
  error?: { current?: string };
}) => void;

function setUp() {
  const listeners = new Set<Listener>();
  const downloads = {
    download: vi.fn().mockResolvedValue(5),
    onChanged: {
      addListener: vi.fn((listener: Listener) => listeners.add(listener)),
      removeListener: vi.fn((listener: Listener) => listeners.delete(listener)),
    },
  };
  const emit: Listener = (delta) => {
    listeners.forEach((listener) => {
      listener(delta);
    });
  };
  const claims = { claim: vi.fn(), release: vi.fn() };
  return {
    downloads,
    listeners,
    emit,
    claims,
    saver: new DownloadSaver(
      downloads,
      claims,
      new DownloadCompletion(downloads.onChanged),
    ),
  };
}

async function started(downloads: ReturnType<typeof setUp>["downloads"]) {
  await vi.waitFor(() => {
    expect(downloads.onChanged.addListener).toHaveBeenCalled();
  });
}

describe("DownloadSaver", () => {
  it("downloads to the default folder without asking", async () => {
    const { downloads, emit, saver } = setUp();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    emit({ id: 5, state: { current: "complete" } });
    await saving;

    expect(downloads.download).toHaveBeenCalledWith({
      url: "blob:x",
      filename: "name.png",
      saveAs: false,
      conflictAction: "uniquify",
    });
  });

  it("waits for its own download to complete, ignoring others and progress", async () => {
    const { downloads, emit, listeners, saver } = setUp();
    let done = false;

    const saving = saver.save("blob:x", "name.png").then(() => {
      done = true;
    });
    await started(downloads);
    emit({ id: 9, state: { current: "complete" } });
    emit({ id: 5 });
    emit({ id: 5, state: {} });
    emit({ id: 5, state: { current: "in_progress" } });
    await Promise.resolve();
    expect(done).toBe(false);

    emit({ id: 5, state: { current: "complete" } });
    await saving;

    expect(done).toBe(true);
    expect(listeners.size).toBe(0);
  });

  it("fails with Chrome's reason when the download is interrupted", async () => {
    const { downloads, emit, listeners, saver } = setUp();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    emit({
      id: 5,
      state: { current: "interrupted" },
      error: { current: "FILE_NO_SPACE" },
    });

    await expect(saving).rejects.toThrow("FILE_NO_SPACE");
    expect(listeners.size).toBe(0);
  });

  it("claims the name before the download starts and releases it once saved", async () => {
    const { downloads, emit, claims, saver } = setUp();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    expect(claims.claim).toHaveBeenCalledWith("blob:x", "name.png");
    expect(claims.claim.mock.invocationCallOrder[0]).toBeLessThan(
      downloads.download.mock.invocationCallOrder[0]!,
    );
    expect(claims.release).not.toHaveBeenCalled();
    emit({ id: 5, state: { current: "complete" } });
    await saving;

    expect(claims.release).toHaveBeenCalledWith("blob:x");
  });

  it("releases the name when the download cannot start", async () => {
    const { downloads, claims, saver } = setUp();
    downloads.download.mockRejectedValue(new Error("Invalid filename"));

    await expect(saver.save("blob:x", "name.png")).rejects.toThrow(
      "Invalid filename",
    );
    expect(claims.release).toHaveBeenCalledWith("blob:x");
  });

  it("fails with a general reason when Chrome gives none", async () => {
    const { downloads, emit, saver } = setUp();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    emit({ id: 5, state: { current: "interrupted" } });

    await expect(saving).rejects.toThrow("Download interrupted");
  });
});

// The real claims and listening behind the saver, so that the listener's life
// is checked against the download call itself.
function setUpListening() {
  const { downloads, emit } = setUp();
  const event = { addListener: vi.fn(), removeListener: vi.fn() };
  const claims = new ClaimedFilenames(new FilenameListening(event, vi.fn()));
  return {
    downloads,
    emit,
    event,
    saver: new DownloadSaver(
      downloads,
      claims,
      new DownloadCompletion(downloads.onChanged),
    ),
  };
}

describe("DownloadSaver listening for names", () => {
  it("adds the filename listener before the download starts and removes it once saved", async () => {
    const { downloads, emit, event, saver } = setUpListening();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    expect(event.addListener.mock.invocationCallOrder[0]).toBeLessThan(
      downloads.download.mock.invocationCallOrder[0]!,
    );
    emit({ id: 5, state: { current: "complete" } });
    await saving;

    expect(event.removeListener).toHaveBeenCalledTimes(1);
  });

  it("removes the listener when the download is interrupted", async () => {
    const { downloads, emit, event, saver } = setUpListening();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    emit({ id: 5, state: { current: "interrupted" } });

    await expect(saving).rejects.toThrow("Download interrupted");
    expect(event.removeListener).toHaveBeenCalledTimes(1);
  });

  it("removes the listener when Chrome refuses the download", async () => {
    const { downloads, event, saver } = setUpListening();
    downloads.download.mockRejectedValue(new Error("Invalid filename"));

    await expect(saver.save("blob:x", "name.png")).rejects.toThrow(
      "Invalid filename",
    );
    expect(event.removeListener).toHaveBeenCalledTimes(1);
  });

  it("removes the listener when the download call throws", async () => {
    const { downloads, event, saver } = setUpListening();
    downloads.download.mockImplementation(() => {
      throw new Error("downloads is gone");
    });

    await expect(saver.save("blob:x", "name.png")).rejects.toThrow(
      "downloads is gone",
    );
    expect(event.addListener).toHaveBeenCalledTimes(1);
    expect(event.removeListener).toHaveBeenCalledTimes(1);
  });
});
