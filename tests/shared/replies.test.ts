import type { Command } from "../../src/shared/command";
import { CommandRouter } from "../../src/shared/command-router";
import { everyCommandOnce } from "../../src/shared/every-command-once";
import { OwnContextFilter } from "../../src/shared/own-context-filter";
import { ReplyUnwrapper } from "../../src/shared/reply-unwrapper";
import { SettledResponder } from "../../src/shared/settled-responder";

const replyWhenDone = <T>(
  work: Promise<T>,
  reply: (reply: unknown) => void,
) => {
  new SettledResponder().answer(work, reply);
};
const unwrap = (reply: unknown, who: string) =>
  new ReplyUnwrapper().read(reply, who);

describe("SettledResponder", () => {
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

describe("ReplyUnwrapper", () => {
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

type Double = Extract<TestMessage, { type: "double" }>;
type Fail = Extract<TestMessage, { type: "fail" }>;

class DoubleCommand implements Command<TestMessage, "double"> {
  readonly type = "double";

  accepts(message: unknown): message is Double {
    return typeof (message as { n?: unknown }).n === "number";
  }

  handle(message: Double): Promise<number> {
    return Promise.resolve(message.n * 2);
  }
}

class FailCommand implements Command<TestMessage, "fail"> {
  readonly type = "fail";

  accepts(_message: unknown): _message is Fail {
    return true;
  }

  handle(): Promise<never> {
    return Promise.reject(new Error("failed"));
  }
}

const ME = { id: "me" };

function router() {
  return new CommandRouter<TestMessage>(
    everyCommandOnce<TestMessage>()(new DoubleCommand(), new FailCommand()),
    new OwnContextFilter("me", "here"),
    new SettledResponder(),
  );
}

describe("everyCommandOnce", () => {
  it("lists the commands when every type has exactly one", () => {
    const commands = [new DoubleCommand(), new FailCommand()] as const;

    expect(everyCommandOnce<TestMessage>()(...commands)).toEqual(commands);
  });

  it("does not compile with a type left out or handled twice", () => {
    const list = everyCommandOnce<TestMessage>();

    // @ts-expect-error The fail message has no command.
    list(new DoubleCommand());
    // @ts-expect-error The double message has two commands.
    list(new DoubleCommand(), new FailCommand(), new DoubleCommand());
  });
});

describe("CommandRouter", () => {
  it("runs the handler and answers with its value", async () => {
    const reply = vi.fn();

    const later = router().route(
      { target: "here", type: "double", n: 4 },
      ME,
      reply,
    );

    expect(later).toBe(true);
    await vi.waitFor(() => {
      expect(reply).toHaveBeenCalledWith({ ok: true, value: 8 });
    });
  });

  it("answers with the handler's error", async () => {
    const reply = vi.fn();

    router().route({ target: "here", type: "fail" }, ME, reply);

    await vi.waitFor(() => {
      expect(reply).toHaveBeenCalledWith({ ok: false, error: "failed" });
    });
  });

  it("ignores messages for another context", () => {
    const reply = vi.fn();

    expect(router().route({ target: "there", type: "double" }, ME, reply)).toBe(
      false,
    );
    expect(reply).not.toHaveBeenCalled();
  });

  it("ignores types it has no handler for", () => {
    const reply = vi.fn();

    expect(router().route({ target: "here", type: "other" }, ME, reply)).toBe(
      false,
    );
    expect(reply).not.toHaveBeenCalled();
  });

  it.each([
    ["another extension", { id: "them" }],
    ["a page with no id", {}],
    ["no sender", undefined],
  ])("ignores a message from %s", (_who, sender) => {
    const reply = vi.fn();

    expect(
      router().route({ target: "here", type: "fail" }, sender, reply),
    ).toBe(false);
    expect(reply).not.toHaveBeenCalled();
  });

  it.each(["constructor", "__proto__", "toString", 5, undefined])(
    "ignores the inherited or odd type %s",
    (type) => {
      expect(router().route({ target: "here", type }, ME, vi.fn())).toBe(false);
    },
  );

  it("ignores a message whose fields are the wrong type", () => {
    const reply = vi.fn();

    expect(
      router().route({ target: "here", type: "double", n: "4" }, ME, reply),
    ).toBe(false);
    expect(reply).not.toHaveBeenCalled();
  });
});
