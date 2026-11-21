// Checks for what the page script reads from the page itself.
import { isFields } from "../shared/fields";
import type { Guard } from "./guard";
import type { InlineStyle, Styled } from "./inline-styles";
import type { Installed } from "./reinstaller";
import type { Restorable } from "./restorable";

// A browser class, such as Element or HTMLImageElement.
type Kind<T> = abstract new (...args: never[]) => T;

const STYLE_METHODS = [
  "getPropertyValue",
  "getPropertyPriority",
  "setProperty",
  "removeProperty",
] as const satisfies readonly (keyof InlineStyle)[];

const isMethod = (value: unknown): boolean => typeof value === "function";

const isInlineStyle = (value: unknown): value is InlineStyle =>
  isFields(value) && STYLE_METHODS.every((method) => isMethod(value[method]));

const isStyled = (value: unknown): value is Styled =>
  isFields(value) && isInlineStyle(value.style);

// An instance of one of the browser's own classes.
export class InstanceGuard<T> implements Guard<T> {
  constructor(private readonly kind: Kind<T>) {}

  matches(value: unknown): value is T {
    return value instanceof this.kind;
  }
}

// One that also has an inline style, which not every element does.
export class StyledGuard<T> implements Guard<T & Styled> {
  constructor(private readonly kind: Guard<T>) {}

  matches(value: unknown): value is T & Styled {
    return this.kind.matches(value) && isStyled(value);
  }
}

// A function that takes as many arguments as the kind it stands for. That is
// as much of a function's type as can be checked while the script runs.
export class FunctionGuard<F> implements Guard<F> {
  constructor(private readonly arity: number) {}

  matches(value: unknown): value is F {
    return typeof value === "function" && value.length === this.arity;
  }
}

// Something that can put the page back.
export class RestorableGuard implements Guard<Restorable> {
  matches(value: unknown): value is Restorable {
    return isFields(value) && isMethod(value.restore);
  }
}

// What an earlier copy of the script left behind, checked field by field.
export class InstalledGuard<L> implements Guard<Installed<L>> {
  constructor(
    private readonly listener: Guard<L>,
    private readonly controller: Guard<Restorable>,
  ) {}

  matches(value: unknown): value is Installed<L> {
    return isFields(value) && this.holds(value);
  }

  private holds(value: Record<string, unknown>): boolean {
    return (
      this.listener.matches(value.listener) &&
      this.controller.matches(value.controller)
    );
  }
}
