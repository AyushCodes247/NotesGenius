import { AppError } from "@utils/general.util.js";
import gemini from "@ai/providers/gemini.client.js";
import env from "@configs/env.config.js";
import logger from "@utils/logger.util.js";

interface GeminiGenerationInput {
  prompt: string;
}

const generateContent = async ({
  prompt,
}: GeminiGenerationInput): Promise<string> => {
  try {
    const response = await gemini.models.generateContent({
      model: env.GEMINI_GENERATION_MODEL,
      contents: prompt,
    });

    const generatedText = response.text;

    if (!generatedText?.trim()) {
      throw new AppError("Gemini returned an empty response.", 502);
    }

    return generatedText.trim();
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Gemini generation error.",
    );

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 503
    ) {
      throw new AppError(
        "Gemini is temporarily unavailable due to high demand. Please try again.",
        503,
        error instanceof Error ? error : undefined,
      );
    }

    throw new AppError(
      "Failed to generate content using Gemini.",
      502,
      error instanceof Error ? error : undefined,
    );
  }
};

export default generateContent;
