import { DeviceSchemeCommand } from "../../src/background/device-scheme-command";

function setUp() {
  const sink = { deviceIs: vi.fn(() => Promise.resolve()) };
  return { sink, command: new DeviceSchemeCommand(sink) };
}

describe("DeviceSchemeCommand", () => {
  it.each(["light", "dark"])("accepts a %s colour scheme", (scheme) => {
    expect(setUp().command.accepts({ scheme })).toBe(true);
  });

  it.each(["sepia", 7, undefined])("refuses a %s colour scheme", (scheme) => {
    expect(setUp().command.accepts({ scheme })).toBe(false);
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
