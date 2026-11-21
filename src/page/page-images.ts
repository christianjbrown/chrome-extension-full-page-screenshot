// Where an image sits in the viewport, in CSS pixels.
export interface ImageBox {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageImage {
  complete: boolean;
  getBoundingClientRect(): ImageBox;
  decode(): Promise<void>;
}

// Every image on the page.
export interface PageImages {
  all(): PageImage[];
}
