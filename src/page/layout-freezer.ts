import type { PageElements } from "./page-elements";
import type { StyleOverrides } from "./style-ledger";

export interface Freezer {
  freeze(hideFixed: boolean): void;
}

// Stops headers and footers from repeating down the stitched image.
export class LayoutFreezer implements Freezer {
  constructor(
    private readonly elements: PageElements,
    private readonly ledger: StyleOverrides,
  ) {}

  // Sticky elements go back to where they sit in the page, and fixed ones,
  // which already showed in the first slice, disappear from the rest. Pages
  // often only make a header fixed once scrolled, so this looks again each time.
  freeze(hideFixed: boolean): void {
    this.elements.all().forEach((element) => {
      const { position } = this.elements.lookOf(element);
      if (position === "sticky") {
        this.ledger.override(element, "position", "relative");
        this.ledger.override(element, "inset", "auto");
      }
      if (hideFixed && position === "fixed") {
        this.ledger.override(element, "opacity", "0");
        this.ledger.override(element, "transition", "none");
      }
    });
  }
}
