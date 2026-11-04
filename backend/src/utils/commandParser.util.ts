import {
  COMMANDS,
  DEFAULT_COMMAND,
  type Command,
} from "@ai/constants/commands.constant.js";

import { AppError } from "@utils/general.util.js";

interface ParsedCommand {
  command: Command;
  query: string;
}

const parseCommand = (input: string): ParsedCommand => {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    return {
      command: DEFAULT_COMMAND,
      query: "",
    };
  }

  const [firstWord = "", ...remainingWords] = normalizedInput.split(/\s+/);

  if (!firstWord.startsWith("@")) {
    return {
      command: DEFAULT_COMMAND,
      query: normalizedInput,
    };
  }

  if (!COMMANDS.includes(firstWord as Command)) {
    throw new AppError(`Unsupported command: ${firstWord}`, 400);
  }

  return {
    command: firstWord as Command,
    query: remainingWords.join(" "),
  };
};

export default parseCommand;
