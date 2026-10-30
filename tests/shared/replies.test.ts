import { CommandRouter } from "../../src/shared/command-router";
import { replyWhenDone, unwrap } from "../../src/shared/replies";

describe("replyWhenDone", () => {
  it("answers with the value once the work succeeds", async () => {
    const reply = vi.fn();

    replyWhenDone(Promise.resolve(7), reply);

    await vi.waitFor(() => {
      expect(reply).toHaveBeenCalledWith({ ok: true, value: 7 });
    });
  });

  it("answers with the reason once the work fails", async () => {
    const reply = vi.fn();

    replyWhenDone(Promise.reject(new Error("nope")), reply);

    await vi.waitFor(() => {
      expect(reply).toHaveBeenCalledWith({ ok: false, error: "nope" });
    });
  });
});

describe("unwrap", () => {
  it("returns the value of a good reply", () => {
    expect(unwrap({ ok: true, value: "x" }, "The page")).toBe("x");
  });

  it("throws the other side's error", () => {
    expect(() => unwrap({ ok: false, error: "broken" }, "The page")).toThrow(
      "broken",
    );
  });

  it("says who did not answer", () => {
    expect(() => unwrap(undefined, "The page")).toThrow(
      "The page did not answer",
    );
  });
});

type TestMessage =
  | { target: "here"; type: "double"; n: number }
  | { target: "here"; type: "fail" };

function router() {
  return new CommandRouter<TestMessage>("here", {
    double: (message) => Promise.resolve(message.n * 2),
    fail: () => Promise.reject(new Error("failed")),
  });
}

describe("CommandRouter", () => {
  it("runs the handler and answers with its value", async () => {
    const reply = vi.fn();

    const later = router().route(
      { target: "here", type: "double", n: 4 },
      reply,
    );

    expect(later).toBe(true);
    await vi.waitFor(() => {
      expect(reply).toHaveBeenCalledWith({ ok: true, value: 8 });
    });
  });

  it("answers with the handler's error", async () => {
    const reply = vi.fn();

    router().route({ target: "here", type: "fail" }, reply);

    await vi.waitFor(() => {
      expect(reply).toHaveBeenCalledWith({ ok: false, error: "failed" });
    });
  });

  it("ignores messages for another context", () => {
    const reply = vi.fn();

    expect(router().route({ target: "there", type: "double" }, reply)).toBe(
      false,
    );
    expect(reply).not.toHaveBeenCalled();
  });

  it("ignores types it has no handler for", () => {
    const reply = vi.fn();

    expect(router().route({ target: "here", type: "other" }, reply)).toBe(
      false,
    );
    expect(reply).not.toHaveBeenCalled();
  });
});
