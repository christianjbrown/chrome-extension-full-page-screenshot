import { DeviceGeometry } from "../../src/offscreen/device-geometry";

describe("DeviceGeometry", () => {
  const geometry = new DeviceGeometry();

  it("scales by the capture's width against the page's", () => {
    expect(geometry.scaleFor(2400, 1200)).toBe(2);
    expect(geometry.heightOf(1001, 1.5)).toBe(1502);
  });

  it("places a box at device pixels, offset by the scroll", () => {
    expect(
      geometry.place({ x: 10, y: 20, width: 100, height: 50 }, 300, 2, 5000),
    ).toEqual({
      source: { x: 20, y: 40, width: 200, height: 100 },
      top: 640,
    });
  });

  it("cuts a box off at the bottom of the picture", () => {
    expect(
      geometry.place({ x: 0, y: 0, width: 100, height: 500 }, 0, 1, 200),
    ).toMatchObject({ source: { height: 200 }, top: 0 });
  });
});
