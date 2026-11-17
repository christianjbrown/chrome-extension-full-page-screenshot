import { ClickScheme } from "../../src/background/click-scheme";

function fakes(scheme: "light" | "dark" | undefined) {
  const reader = { read: vi.fn().mockResolvedValue(scheme) };
  const sink = { tabShows: vi.fn().mockResolvedValue(undefined) };
  return { reader, sink, click: new ClickScheme(reader, sink) };
}

describe("ClickScheme", () => {
  it("passes on the scheme the clicked tab is in", async () => {
    const { click, reader, sink } = fakes("dark");

    await click.clicked({ id: 6 });

    expect(reader.read).toHaveBeenCalledWith(6);
    expect(sink.tabShows).toHaveBeenCalledWith("dark");
  });

  it("says nothing when the tab could not be read", async () => {
    const { click, sink } = fakes(undefined);

    await click.clicked({ id: 6 });

    expect(sink.tabShows).not.toHaveBeenCalled();
  });

  it("does nothing for a tab with no id", async () => {
    const { click, reader } = fakes("dark");

    await click.clicked({});

    expect(reader.read).not.toHaveBeenCalled();
  });
});
