import { IMPORTANT } from "./css";
import type { StyleOverrides, StyleRestoration, Styled } from "./inline-styles";

// What getPropertyValue gives for a property with no inline value.
const NOT_SET = "";

interface Original {
  target: Styled;
  property: string;
  value: string;
  priority: string;
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
    target.style.setProperty(property, value, IMPORTANT);
  }

  restore(): void {
    this.originals
      .toReversed()
      .forEach(({ target, property, value, priority }) => {
        if (value === NOT_SET) {
          target.style.removeProperty(property);
        } else {
          target.style.setProperty(property, value, priority);
        }
      });
    this.originals = [];
  }
}
