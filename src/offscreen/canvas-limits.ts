// Chrome refuses canvases past a certain size, so a taller picture is cut into
// parts, each its own file. These are Chrome's limits, not settings: the
// tallest side and the most pixels one part may have.
const MEBI = 1024 * 1024;

export const MAX_PART_SIDE = 16384;
export const MAX_PART_PIXELS = 64 * MEBI;
