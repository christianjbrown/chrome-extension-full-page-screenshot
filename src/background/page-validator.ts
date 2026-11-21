import type { PageLayout } from "../shared/page-layout";

// Checks what the page reports before the rest of the capture trusts it.
export interface PageValidator {
  layout(value: unknown): PageLayout;
  scroll(value: unknown): number;
}
