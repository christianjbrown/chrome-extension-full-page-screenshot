export interface ObjectUrls {
  create(blob: Blob): string;
}

export interface UrlFactory {
  createObjectURL(blob: Blob): string;
}

export class BlobUrls implements ObjectUrls {
  constructor(private readonly urls: UrlFactory) {}

  create(blob: Blob): string {
    return this.urls.createObjectURL(blob);
  }
}
