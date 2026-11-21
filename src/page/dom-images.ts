import type { Guard } from "./guard";
import type { PageImage, PageImages } from "./page-images";

export interface DocumentImages {
  images: Iterable<unknown>;
}

// The document's images, as far as the guard recognises them.
export class DomImages implements PageImages {
  constructor(
    private readonly document: DocumentImages,
    private readonly guard: Guard<PageImage>,
  ) {}

  all(): PageImage[] {
    return Array.from(this.document.images).filter((value) =>
      this.guard.matches(value),
    );
  }
}
