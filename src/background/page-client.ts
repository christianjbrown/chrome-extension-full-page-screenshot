import type { PageLayout, PageMessage } from "../shared/messages";
import { unwrap } from "../shared/replies";

// The service worker's handle on the script it injects into the page.
export interface PageDriver {
  inject(tabId: number): Promise<void>;
  prepare(tabId: number): Promise<PageLayout>;
  // Where the page actually ended up, which near the bottom can be short of y.
  scrollTo(tabId: number, y: number, hideFixed: boolean): Promise<number>;
  restore(tabId: number): Promise<void>;
}

export interface ScriptingApi {
  executeScript(injection: {
    target: { tabId: number };
    files: string[];
  }): Promise<unknown>;
}

export interface TabMessagingApi {
  sendMessage(tabId: number, message: PageMessage): Promise<unknown>;
}

export class PageClient implements PageDriver {
  constructor(
    private readonly scripting: ScriptingApi,
    private readonly tabs: TabMessagingApi,
    private readonly file: string,
  ) {}

  async inject(tabId: number): Promise<void> {
    await this.scripting.executeScript({
      target: { tabId },
      files: [this.file],
    });
  }

  prepare(tabId: number): Promise<PageLayout> {
    return this.ask(tabId, { target: "page", type: "prepare" });
  }

  scrollTo(tabId: number, y: number, hideFixed: boolean): Promise<number> {
    return this.ask(tabId, { target: "page", type: "scroll", y, hideFixed });
  }

  restore(tabId: number): Promise<void> {
    return this.ask(tabId, { target: "page", type: "restore" });
  }

  private async ask<T>(tabId: number, message: PageMessage): Promise<T> {
    return unwrap(await this.tabs.sendMessage(tabId, message), "The page") as T;
  }
}
