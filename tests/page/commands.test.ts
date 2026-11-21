import { PrepareCommand } from "../../src/page/prepare-command";
import { RestoreCommand } from "../../src/page/restore-command";
import { ScrollCommand } from "../../src/page/scroll-command";

const toPage = (type: string, fields: object = {}) => ({
  target: "page",
  type,
  ...fields,
});

const layout = {
  viewportWidth: 1,
  viewportHeight: 1,
  frameTop: 0,
  frameHeight: 1,
  frameLeft: 0,
  frameWidth: 1,
  scrollHeight: 1,
};

describe("PrepareCommand", () => {
  it("accepts the bare message and answers with the layout", async () => {
    const command = new PrepareCommand({
      prepare: () => Promise.resolve(layout),
    });

    expect(command.accepts(toPage("prepare"))).toBe(true);
    expect(command.accepts(toPage("restore"))).toBe(false);
    expect(command.accepts({ target: "offscreen", type: "prepare" })).toBe(
      false,
    );
    expect(command.accepts(null)).toBe(false);
    await expect(command.handle()).resolves.toEqual(layout);
  });
});

describe("ScrollCommand", () => {
  const page = () => ({ scrollTo: vi.fn(() => Promise.resolve(40)) });

  it("needs a numeric y and a hideFixed flag", () => {
    const command = new ScrollCommand(page());

    expect(command.accepts(toPage("scroll", { y: 1, hideFixed: true }))).toBe(
      true,
    );
    expect(command.accepts(toPage("scroll", { y: "1", hideFixed: true }))).toBe(
      false,
    );
    expect(command.accepts(toPage("scroll", { y: 1, hideFixed: "yes" }))).toBe(
      false,
    );
    expect(command.accepts(toPage("restore", { y: 1, hideFixed: true }))).toBe(
      false,
    );
    expect(command.accepts(undefined)).toBe(false);
  });

  it("scrolls and answers with where the page landed", async () => {
    const scroller = page();

    await expect(
      new ScrollCommand(scroller).handle({
        target: "page",
        type: "scroll",
        y: 50,
        hideFixed: false,
      }),
    ).resolves.toBe(40);
    expect(scroller.scrollTo).toHaveBeenCalledWith(50, false);
  });
});

describe("RestoreCommand", () => {
  it("accepts the bare message and puts the page back", async () => {
    const page = { restore: vi.fn(() => Promise.resolve()) };
    const command = new RestoreCommand(page);

    expect(command.accepts(toPage("restore"))).toBe(true);
    expect(command.accepts(toPage("prepare"))).toBe(false);
    await command.handle();

    expect(page.restore).toHaveBeenCalledTimes(1);
  });
});
