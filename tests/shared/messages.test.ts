import { errorMessage } from "../../src/shared/error-message";
import { isMessageFor } from "../../src/shared/messages";
import { RuntimeMessenger } from "../../src/shared/runtime-messenger";

describe("isMessageFor", () => {
  it("accepts a message addressed to the target", () => {
    expect(
      isMessageFor({ target: "offscreen", type: "stop" }, "offscreen"),
    ).toBe(true);
  });

  it("rejects a message addressed elsewhere", () => {
    expect(isMessageFor({ target: "background", type: "x" }, "offscreen")).toBe(
      false,
    );
  });

  it.each([null, undefined, "offscreen", 42])("rejects %s", (message) => {
    expect(isMessageFor(message, "offscreen")).toBe(false);
  });
});

describe("errorMessage", () => {
  it("uses an Error's message", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("stringifies anything else", () => {
    expect(errorMessage("plain")).toBe("plain");
  });
});

describe("RuntimeMessenger", () => {
  it("sends through the channel and returns its reply", async () => {
    const sendMessage = vi.fn().mockResolvedValue("reply");
    const messenger = new RuntimeMessenger<{ hello: string }>({ sendMessage });

    await expect(messenger.send({ hello: "there" })).resolves.toBe("reply");
    expect(sendMessage).toHaveBeenCalledWith({ hello: "there" });
  });
});
