import { schemeFor, type ColourScheme } from "../shared/colour-scheme";
import type { SchemeReader } from "./scheme-ports";

// Says whether the tab's page matches a media query, run inside the tab.
export type TabProbe = (query: string) => boolean;

export interface ScriptRunner {
  executeScript(injection: {
    target: { tabId: number };
    func: TabProbe;
    args: [string];
  }): Promise<{ result?: unknown }[]>;
}

type Frames = { result?: unknown }[];

// Anything but a yes or no means the tab could not say.
const schemeOfResult = (result: unknown): ColourScheme | undefined =>
  typeof result === "boolean" ? schemeFor(result) : undefined;

// The top frame's answer, when there is a frame at all.
const schemeOf = ([frame]: Frames): ColourScheme | undefined =>
  schemeOfResult(frame?.result);

// Reads the colour scheme from a page in a tab, which follows Chrome's own
// Light and Dark setting. Only works in a tab the extension has been let into.
export class TabScheme implements SchemeReader {
  constructor(
    private readonly scripting: ScriptRunner,
    private readonly probe: TabProbe,
    // The media query that is true in a dark page.
    private readonly darkQuery: string,
  ) {}

  // Chrome's own pages, and tabs that have closed, cannot be asked.
  async read(tabId: number): Promise<ColourScheme | undefined> {
    try {
      return schemeOf(
        await this.scripting.executeScript({
          target: { tabId },
          func: this.probe,
          args: [this.darkQuery],
        }),
      );
    } catch {
      return undefined;
    }
  }
}
