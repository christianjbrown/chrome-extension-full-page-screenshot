// One part of a screenshot and the name it is saved under.
export interface NamedFile {
  url: string;
  filename: string;
}

export interface ScreenshotNamer {
  // Gives each part of the screenshot, top to bottom, its filename.
  name(title: string | undefined, urls: string[]): NamedFile[];
}
