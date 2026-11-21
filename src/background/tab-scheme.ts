import { schemeFor, type ColourScheme } from "../shared/colour-scheme";
import type { SchemeReader } from "./click-scheme";

export interface ScriptRunner {
  executeScript(injection: {
    target: { tabId: number };
    func: () => boolean;
  }): Promise<{ result?: unknown }[]>;
}

// Runs inside the tab, so it can use nothing from this file: Chrome sends the
// function's own text across, and the query has to be written out in it. A
// test pins it to DARK_SCHEME_QUERY.
export function tabPrefersDark(): boolean {
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

// Reads the colour scheme from a page in a tab, which follows Chrome's own
// Light and Dark setting. Only works in a tab the extension has been let into.
export class TabScheme implements SchemeReader {
  constructor(private readonly scripting: ScriptRunner) {}

  // Chrome's own pages, and tabs that have closed, cannot be asked.
  async read(tabId: number): Promise<ColourScheme | undefined> {
    try {
      const [frame] = await this.scripting.executeScript({
        target: { tabId },
        func: tabPrefersDark,
      });
      if (typeof frame?.result !== "boolean") {
        return undefined;
      }
      return schemeFor(frame.result);
    } catch {
      return undefined;
    }
  }
}
