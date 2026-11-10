import type { Command } from "@ai/constants/commands.constant.js";
import parseCommand from "@utils/commandParser.util.js";
import { AppError } from "@utils/general.util.js";
import summarizePrompt from "@ai/prompts/summarize.prompt.js";
import explainPrompt from "@ai/prompts/explain.prompt.js";
import createPrompt from "@ai/prompts/create.prompt.js";
import bulletPrompt from "@ai/prompts/bulletPoint.prompt.js";
import shortPrompt from "@ai/prompts/shortSummarize.prompt.js";
import generateContent from "@ai/generators/gemini.generator.js";

interface GenerationInput {
  query?: string;
  context?: string;
}

interface PromptInput {
  query: string;
  context?: string;
}

const PROMPT_BUILDERS: Record<Command, (input: PromptInput) => string> = {
  "@summarize": summarizePrompt,
  "@create": createPrompt,
  "@bulletpoints": bulletPrompt,
  "@short-summarize": shortPrompt,
  "@explain": explainPrompt,
};

const generationService = async ({
  query = "",
  context,
}: GenerationInput): Promise<string> => {
  const normalizedQuery = query.trim();
  const normalizedContext = context?.trim();

  const { command, query: userQuery } = parseCommand(normalizedQuery);

  if (!userQuery && !normalizedContext) {
    throw new AppError(
      "Please provide a topic or source content to generate notes.",
      400,
    );
  }

  const promptInput: PromptInput = {
    query: userQuery,
    ...(normalizedContext ? { context: normalizedContext } : {}),
  };

  const promptBuilder = PROMPT_BUILDERS[command];
  const prompt = promptBuilder(promptInput);

  return await generateContent({ prompt });
};

export default generationService;
