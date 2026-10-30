import { DownloadSaver } from "../../src/background/download-saver";

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
  return { downloads, listeners, emit, saver: new DownloadSaver(downloads) };
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

  it("fails with a general reason when Chrome gives none", async () => {
    const { downloads, emit, saver } = setUp();

    const saving = saver.save("blob:x", "name.png");
    await started(downloads);
    emit({ id: 5, state: { current: "interrupted" } });

    await expect(saving).rejects.toThrow("Download interrupted");
  });
});
