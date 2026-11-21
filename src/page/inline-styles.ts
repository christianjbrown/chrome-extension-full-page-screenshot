// The part of CSSStyleDeclaration the page script uses.
export interface InlineStyle {
  getPropertyValue(property: string): string;
  getPropertyPriority(property: string): string;
  setProperty(property: string, value: string, priority: string): void;
  removeProperty(property: string): string;
}

// Anything with an inline style: an element, or the document's root.
export interface Styled {
  style: InlineStyle;
}

// Overrides one inline style for the capture.
export interface StyleOverrides {
  override(target: Styled, property: string, value: string): void;
}

// Puts back every inline style that was overridden.
export interface StyleRestoration {
  restore(): void;
}
