import { PAGE_CONFIG } from "../../src/page/config";

describe("page config", () => {
  it("lets the page settle for 100 ms after each scroll", () => {
    expect(PAGE_CONFIG.settleMs).toBe(100);
  });

  it("gives a slow image two seconds", () => {
    expect(PAGE_CONFIG.imagePatienceMs).toBe(2000);
  });
});
