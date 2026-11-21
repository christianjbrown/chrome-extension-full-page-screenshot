import { DeviceSchemeCommand } from "../../src/background/device-scheme-command";

function setUp() {
  const sink = { deviceIs: vi.fn(() => Promise.resolve()) };
  return { sink, command: new DeviceSchemeCommand(sink) };
}

const report = (scheme: unknown, type = "scheme") => ({
  target: "background",
  type,
  scheme,
});

describe("DeviceSchemeCommand", () => {
  it.each(["light", "dark"])("accepts a %s colour scheme", (scheme) => {
    expect(setUp().command.accepts(report(scheme))).toBe(true);
  });

  it.each(["sepia", 7, undefined])("refuses a %s colour scheme", (scheme) => {
    expect(setUp().command.accepts(report(scheme))).toBe(false);
  });

  it("refuses another type of message, or no message at all", () => {
    expect(setUp().command.accepts(report("light", "other"))).toBe(false);
    expect(setUp().command.accepts(null)).toBe(false);
  });

  it("tells the toolbar which scheme the device is in", async () => {
    const { sink, command } = setUp();

    await command.handle({
      target: "background",
      type: "scheme",
      scheme: "light",
    });

    expect(sink.deviceIs).toHaveBeenCalledWith("light");
  });
});
