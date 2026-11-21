// What the person who clicked is told when Chrome will not let a tab be
// captured. The rules that check first and the explainer that translates
// Chrome's own errors afterwards say the same things.
export const REFUSALS = {
  ownPages: "Chrome does not let extensions capture its own pages",
  webStore: "Chrome does not let extensions capture the Web Store",
  localFiles:
    "Turn on Allow access to file URLs for this extension to capture local files",
  leftTab: "Stay on the tab until the screenshot is done",
} as const;
