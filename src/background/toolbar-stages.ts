// How each kind of stage looks on the button. The wording and colours are
// passed in by the root.
import type { Look, Stage } from "./screenshot-indicator";

const PERCENT = 100;
const PERCENT_SIGN = "%";

// A stage that always looks the same.
export class SteadyStage implements Stage<undefined> {
  constructor(private readonly look: Look) {}

  lookFor(): Look {
    return this.look;
  }
}

// Shows how far the capture has got as a percentage on the badge.
export class ProgressStage implements Stage<number> {
  constructor(
    private readonly colour: string,
    private readonly title: string,
  ) {}

  lookFor(fraction: number): Look {
    return {
      badge: String(Math.round(fraction * PERCENT)) + PERCENT_SIGN,
      colour: this.colour,
      title: this.title,
    };
  }
}

// Says why the screenshot failed after the look's own title.
export class FailedStage implements Stage<string> {
  constructor(private readonly look: Look) {}

  lookFor(reason: string): Look {
    return { ...this.look, title: this.look.title + reason };
  }
}
