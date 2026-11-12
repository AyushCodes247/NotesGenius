import { AppError } from "@utils/general.util.js";
import gemini from "@ai/providers/gemini.client.js";
import env from "@configs/env.config.js";
import {
  generatedQuizSchema,
  type GeneratedQuiz,
} from "@ai/schemas/quizGeneration.schema.js";
import logger from "@utils/logger.util.js";

interface QuizGenerationInput {
  prompt: string;
}

const QUIZ_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          questionNumber: {
            type: "integer",
          },
          questionText: {
            type: "string",
          },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                optionNumber: {
                  type: "integer",
                },
                optionText: {
                  type: "string",
                },
              },
              required: ["optionNumber", "optionText"],
            },
          },
          correctOptionNumber: {
            type: "integer",
          },
          explanation: {
            type: "string",
          },
          hint: {
            type: "string",
          },
        },
        required: [
          "questionNumber",
          "questionText",
          "options",
          "correctOptionNumber",
          "explanation",
          "hint",
        ],
      },
    },
  },
  required: ["questions"],
};

const generateQuizContent = async ({
  prompt,
}: QuizGenerationInput): Promise<GeneratedQuiz> => {
  try {
    const response = await gemini.models.generateContent({
      model: env.GEMINI_GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_RESPONSE_SCHEMA,
      },
    });

    const generatedText = response.text;

    if (!generatedText?.trim()) {
      throw new AppError("Gemini returned an empty quiz response.", 502);
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (error) {
      logger.error(
        {
          err: error instanceof Error ? error : new Error(String(error)),
        },
        "Gemini quiz JSON parse error.",
      );

      throw new AppError(
        "Gemini returned an invalid quiz response.",
        502,
        error instanceof Error ? error : undefined,
      );
    }

    const validationResult = generatedQuizSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
      logger.error(
        {
          validationError: validationResult.error.flatten(),
        },
        "Gemini quiz validation error.",
      );

      throw new AppError("Gemini returned an invalid quiz structure.", 502);
    }

    return validationResult.data;
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Gemini quiz generation error.",
    );

    if (error instanceof AppError) {
      throw error;
    }

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
      "Failed to generate quiz using Gemini.",
      502,
      error instanceof Error ? error : undefined,
    );
  }
};

export default generateQuizContent;
