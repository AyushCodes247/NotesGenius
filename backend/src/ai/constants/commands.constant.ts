export const COMMANDS = [
  "@summarize",
  "@create",
  "@bulletpoints",
  "@short-summary",
  "@explain",
] as const;

export type Command = (typeof COMMANDS)[number];

export const DEFAULT_COMMAND: Command = "@summarize";
