import {
  SCHEME_CHECK_MS,
  SchemeReporter,
} from "../../src/offscreen/scheme-reporter";

function start(dark: boolean, sendMessage = vi.fn().mockResolvedValue(1)) {
  const query = { matches: dark };
  const ticks: (() => void)[] = [];
  const repeat = vi.fn((work: () => void) => {
    ticks.push(work);
  });
  new SchemeReporter(query, { sendMessage }, repeat).start();
  return {
    query,
    sendMessage,
    repeat,
    tick: () => {
      ticks.forEach((work) => {
        work();
      });
    },
  };
}

const report = (scheme: string) => ({
  target: "background",
  type: "scheme",
  scheme,
});

describe("SchemeReporter", () => {
  it("reports a dark scheme as soon as it starts", () => {
    const { sendMessage } = start(true);

    expect(sendMessage).toHaveBeenCalledExactlyOnceWith(report("dark"));
  });

  it("reports a light scheme as soon as it starts", () => {
    const { sendMessage } = start(false);

    expect(sendMessage).toHaveBeenCalledExactlyOnceWith(report("light"));
  });

  it("looks again every second", () => {
    const { repeat } = start(true);

    expect(repeat).toHaveBeenCalledExactlyOnceWith(
      expect.any(Function),
      SCHEME_CHECK_MS,
    );
  });

  it("says nothing while the scheme stays the same", () => {
    const { sendMessage, tick } = start(true);

    tick();

    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it("reports again when the scheme changes", () => {
    const { query, sendMessage, tick } = start(false);

    query.matches = true;
    tick();

    expect(sendMessage).toHaveBeenLastCalledWith(report("dark"));
  });

  it("sends a report again when the last one did not arrive", async () => {
    const sendMessage = vi
      .fn()
      .mockRejectedValueOnce(new Error("No receiver"))
      .mockResolvedValue(undefined);
    const { tick } = start(true, sendMessage);

    await vi.waitFor(() => {
      tick();
      expect(sendMessage).toHaveBeenCalledTimes(2);
    });
    expect(sendMessage).toHaveBeenLastCalledWith(report("dark"));
  });
});
