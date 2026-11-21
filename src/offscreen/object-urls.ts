// Hands out a URL that a blob can be read from.
export interface ObjectUrls {
  create(blob: Blob): string;
}
