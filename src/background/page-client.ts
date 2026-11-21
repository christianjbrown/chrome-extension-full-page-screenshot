import {
  PAGE_TYPES,
  TARGETS,
  type PageLayout,
  type PageMessage,
} from "../shared/messages";
import type { ReplyReader } from "../shared/replies";
import type { PageDriver } from "./page-driver";
import type { PageValidator } from "./page-validator";

// Who failed to answer, in an error.
const PAGE = "The page";

interface ScriptingApi {
  executeScript(injection: {
    target: { tabId: number };
    files: string[];
  }): Promise<unknown>;
}

interface TabMessagingApi {
  sendMessage(tabId: number, message: PageMessage): Promise<unknown>;
}

export interface PageClientDependencies {
  scripting: ScriptingApi;
  tabs: TabMessagingApi;
  // The page script's file in the extension.
  file: string;
  validator: PageValidator;
  replies: ReplyReader;
}

export class PageClient implements PageDriver {
  constructor(private readonly deps: PageClientDependencies) {}

  async inject(tabId: number): Promise<void> {
    await this.deps.scripting.executeScript({
      target: { tabId },
      files: [this.deps.file],
    });
  }

  async prepare(tabId: number): Promise<PageLayout> {
    return this.deps.validator.layout(
      await this.ask(tabId, { target: TARGETS.page, type: PAGE_TYPES.prepare }),
    );
  }

  async scrollTo(
    tabId: number,
    y: number,
    hideFixed: boolean,
  ): Promise<number> {
    return this.deps.validator.scroll(
      await this.ask(tabId, {
        target: TARGETS.page,
        type: PAGE_TYPES.scroll,
        y,
        hideFixed,
      }),
    );
  }

  async restore(tabId: number): Promise<void> {
    await this.ask(tabId, { target: TARGETS.page, type: PAGE_TYPES.restore });
  }

  private async ask(tabId: number, message: PageMessage): Promise<unknown> {
    const { tabs, replies } = this.deps;
    return replies.read(await tabs.sendMessage(tabId, message), PAGE);
  }
}
