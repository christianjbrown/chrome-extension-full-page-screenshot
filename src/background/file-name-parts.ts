// The two pieces of a screenshot's file name, joined by the same separator.
export const SEPARATOR = "-";

// Turns a page title into the words of a file name.
export interface TitleSlugger {
  // Empty when the title has no letters or digits in it.
  slug(title: string): string;
}

// Says when a screenshot was taken in a form that sorts as text.
export interface TimeStamper {
  stamp(date: Date): string;
}
