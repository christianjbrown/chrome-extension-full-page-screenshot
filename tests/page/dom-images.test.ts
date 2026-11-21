import { DomImages } from "../../src/page/dom-images";
import type { Guard } from "../../src/page/guard";
import type { PageImage } from "../../src/page/page-images";

const picture: PageImage = {
  complete: true,
  getBoundingClientRect: () => ({ top: 0, bottom: 1, left: 0, right: 1 }),
  decode: () => Promise.resolve(),
};

const onlyPicture: Guard<PageImage> = {
  matches: (value: unknown): value is PageImage => value === picture,
};

describe("DomImages", () => {
  it("lists the document's images the guard recognises", () => {
    const images = new DomImages(
      { images: [picture, "not an image"] },
      onlyPicture,
    );

    expect(images.all()).toEqual([picture]);
  });
});
