// One of Chrome's refusals, and what it means for the person who clicked.
export interface Translation {
  explains(error: string): boolean;
  readonly message: string;
}
