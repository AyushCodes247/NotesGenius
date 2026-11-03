import {
  COMMANDS,
  DEFAULT_COMMAND,
  type Command,
} from "@ai/constants/commands.constant.js";

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

  const [firstWord = ""] = normalizedInput.split(/\s+/);

  let command: Command = DEFAULT_COMMAND;
  let query = normalizedInput;

  if (firstWord.startsWith("@")) {
    if (!COMMANDS.includes(firstWord as Command)) {
      throw new Error(`Unsupported command: ${firstWord}`);
    }

    command = firstWord as Command;
    query = normalizedInput.slice(firstWord.length).trim();
  }

  return {
    command,
    query,
  };
};

export default parseCommand;
