// How the toolbar button looks.
export interface Look {
  badge: string;
  colour: string;
  title: string;
}

// One stage of a screenshot, and how the button shows it given what that
// stage knows.
export interface Stage<D> {
  lookFor(detail: D): Look;
}

// Shows a stage of a screenshot on the button.
export interface ScreenshotIndicator {
  show<D>(stage: Stage<D>, detail: D): Promise<void>;
}

// How far down the page a capture has got, from 0 to 1.
export interface ProgressStages {
  progress: Stage<number>;
}

// Every stage of a screenshot, from the click to the saved file. Each is
// built in the root.
export interface ScreenshotStages extends ProgressStages {
  idle: Stage<undefined>;
  saving: Stage<undefined>;
  // Why it failed, in words the person who clicked can act on.
  failed: Stage<string>;
}
