// One reason Chrome will not let an extension capture a tab.
export interface CaptureRule {
  blocks(url: string): Promise<boolean>;
  readonly reason: string;
}
