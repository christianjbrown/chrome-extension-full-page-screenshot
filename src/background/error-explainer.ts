// Says what went wrong in words the person who clicked can act on.
export interface ErrorExplainer {
  explain(error: unknown): string;
}
