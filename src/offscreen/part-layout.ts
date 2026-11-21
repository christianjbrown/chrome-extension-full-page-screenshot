// A band of the picture, in device pixels, that becomes its own file.
export interface Part {
  top: number;
  height: number;
}

export interface PartCutter {
  // The parts a width by height image (in device pixels) is cut into, top to bottom.
  partsFor(width: number, height: number): Part[];
}
