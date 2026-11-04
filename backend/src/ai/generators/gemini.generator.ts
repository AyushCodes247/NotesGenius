import { AppError } from "@utils/general.util.js";
import gemini from "@ai/providers/gemini.client.js";
import env from "@configs/env.config.js";

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
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Failed to generate content using Gemini.", 502);
  }
};

export default generateContent;
