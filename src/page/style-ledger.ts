export interface InlineStyle {
  getPropertyValue(property: string): string;
  getPropertyPriority(property: string): string;
  setProperty(property: string, value: string, priority: string): void;
  removeProperty(property: string): string;
}

export interface Styled {
  style: InlineStyle;
}

interface Original {
  target: Styled;
  property: string;
  value: string;
  priority: string;
}

export interface StyleOverrides {
  override(target: Styled, property: string, value: string): void;
}

export interface StyleRestoration {
  restore(): void;
}

// Overrides inline styles for the capture and remembers exactly what was there
// before, so the page is left as it was found.
export class StyleLedger implements StyleOverrides, StyleRestoration {
  private originals: Original[] = [];

  override(target: Styled, property: string, value: string): void {
    const seen = this.originals.some(
      (original) =>
        original.target === target && original.property === property,
    );
    if (!seen) {
      this.originals.push({
        target,
        property,
        value: target.style.getPropertyValue(property),
        priority: target.style.getPropertyPriority(property),
      });
    }
    target.style.setProperty(property, value, "important");
  }

  restore(): void {
    this.originals
      .toReversed()
      .forEach(({ target, property, value, priority }) => {
        if (value === "") {
          target.style.removeProperty(property);
        } else {
          target.style.setProperty(property, value, priority);
        }
      });
    this.originals = [];
  }
}
