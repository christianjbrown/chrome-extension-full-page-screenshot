import { BeginCommand } from "../../src/offscreen/begin-command";
import { FinishCommand } from "../../src/offscreen/finish-command";
import { SliceCommand } from "../../src/offscreen/slice-command";

const toOffscreen = (type: string, fields: object = {}) => ({
  target: "offscreen",
  type,
  ...fields,
});
const begin = (fields: object) => toOffscreen("begin", fields);
const slice = (fields: object) => toOffscreen("slice", fields);

const rect = { x: 0, y: 0, width: 10, height: 10 };

describe("BeginCommand", () => {
  const stitcher = () => ({ begin: vi.fn(() => Promise.resolve()) });

  it("needs a numeric width and height", () => {
    const command = new BeginCommand(stitcher());

    expect(command.accepts(begin({ width: 1, height: 2 }))).toBe(true);
    expect(command.accepts(begin({ width: "1", height: 2 }))).toBe(false);
    expect(command.accepts(begin({ width: 1 }))).toBe(false);
    expect(command.accepts(slice({ width: 1, height: 2 }))).toBe(false);
    expect(command.accepts(null)).toBe(false);
  });

  it("begins a picture of that size", async () => {
    const starter = stitcher();

    await new BeginCommand(starter).handle({
      target: "offscreen",
      type: "begin",
      width: 1,
      height: 2,
    });

    expect(starter.begin).toHaveBeenCalledWith(1, 2);
  });
});

describe("SliceCommand", () => {
  const stitcher = () => ({ add: vi.fn(() => Promise.resolve()) });

  it("needs a data URL, a scroll and a list of boxes", () => {
    const command = new SliceCommand(stitcher());

    const good = { dataUrl: "data:", scroll: 0, rects: [rect] };

    expect(command.accepts(slice(good))).toBe(true);
    expect(command.accepts(slice({ ...good, dataUrl: 1 }))).toBe(false);
    expect(command.accepts(slice({ dataUrl: "data:", rects: [rect] }))).toBe(
      false,
    );
    expect(command.accepts(slice({ ...good, rects: rect }))).toBe(false);
    expect(command.accepts(slice({ ...good, rects: [{ x: 0 }] }))).toBe(false);
    expect(command.accepts(slice({ ...good, rects: [null] }))).toBe(false);
    expect(command.accepts(begin(good))).toBe(false);
  });

  it("paints the slice", async () => {
    const painter = stitcher();

    await new SliceCommand(painter).handle({
      target: "offscreen",
      type: "slice",
      dataUrl: "data:",
      rects: [rect],
      scroll: 5,
    });

    expect(painter.add).toHaveBeenCalledWith("data:", [rect], 5);
  });
});

describe("FinishCommand", () => {
  it("accepts the bare message and answers with the files", async () => {
    const finisher = { finish: vi.fn(() => Promise.resolve(["blob:1"])) };
    const command = new FinishCommand(finisher);

    expect(command.accepts(toOffscreen("finish"))).toBe(true);
    expect(command.accepts(toOffscreen("begin"))).toBe(false);
    await expect(command.handle()).resolves.toEqual(["blob:1"]);
  });
});
