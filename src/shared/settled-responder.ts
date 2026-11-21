import { errorMessage } from "./error-message";
import type { Reply } from "./messages";
import type { Responder } from "./replies";

// Answers with the value, or the reason the work failed.
export class SettledResponder implements Responder {
  answer<T>(work: Promise<T>, reply: (reply: Reply<T>) => void): void {
    work.then(
      (value) => {
        reply({ ok: true, value });
      },
      (error: unknown) => {
        reply({ ok: false, error: errorMessage(error) });
      },
    );
  }
}
