import type { PageLayout, PageMessage } from "../shared/messages";
import { unwrap } from "../shared/replies";
import type { PageValidator } from "./page-validator";

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
    private readonly validator: PageValidator,
  ) {}

  async inject(tabId: number): Promise<void> {
    await this.scripting.executeScript({
      target: { tabId },
      files: [this.file],
    });
  }

  async prepare(tabId: number): Promise<PageLayout> {
    return this.validator.layout(
      await this.ask(tabId, { target: "page", type: "prepare" }),
    );
  }

  async scrollTo(
    tabId: number,
    y: number,
    hideFixed: boolean,
  ): Promise<number> {
    return this.validator.scroll(
      await this.ask(tabId, { target: "page", type: "scroll", y, hideFixed }),
    );
  }

  async restore(tabId: number): Promise<void> {
    await this.ask(tabId, { target: "page", type: "restore" });
  }

  private async ask(tabId: number, message: PageMessage): Promise<unknown> {
    return unwrap(await this.tabs.sendMessage(tabId, message), "The page");
  }
}
