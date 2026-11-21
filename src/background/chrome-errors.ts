import { errorMessage } from "../shared/error-message";
import type { Translation } from "./chrome-error-translations";
import type { ErrorExplainer } from "./error-explainer";

// Says what Chrome's terser refusals mean for the person who clicked.
export class ChromeErrorExplainer implements ErrorExplainer {
  constructor(private readonly translations: readonly Translation[]) {}

  explain(error: unknown): string {
    const message = errorMessage(error);
    return this.translationOf(message) ?? message;
  }

  private translationOf(message: string): string | undefined {
    return this.translations.find(({ pattern }) => pattern.test(message))
      ?.message;
  }
}
