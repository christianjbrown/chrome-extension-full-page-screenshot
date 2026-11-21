// Stops headers and footers from repeating down the stitched image.
export interface Freezer {
  freeze(hideFixed: boolean): void;
}
