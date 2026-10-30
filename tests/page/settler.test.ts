import { FrameSettler } from "../../src/page/settler";

describe("FrameSettler", () => {
  it("waits two frames and then the delay", async () => {
    const steps: string[] = [];
    const nextFrame = vi.fn((callback: () => void) => {
      steps.push("frame");
      callback();
    });
    const timer = vi.fn((callback: () => void, ms: number) => {
      steps.push(`timer ${String(ms)}`);
      callback();
    });

    await new FrameSettler(nextFrame, timer, 100).settle();

    expect(steps).toEqual(["frame", "frame", "timer 100"]);
  });
});
