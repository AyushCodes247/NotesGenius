import env from "@configs/env.config.js";
import { AppError } from "@utils/general.util.js";
import logger from "@utils/logger.util.js";

const GEMINI_KEY = env.GEMINI_API_KEY;
const GEMINI_BASE_URL = env.GEMINI_BASE_URL;

const GEMINI_EMBEDDING_MODEL = env.GEMINI_EMBEDDING_MODEL;
const GEMINI_GENERATION_MODEL = env.GEMINI_GENERATION_MODEL;

export async function embedText(text?: string): Promise<number[]> {
  try {
    if (!text?.trim()) {
      throw new AppError("Text is required for embedding.", 400);
    }

    const response = await fetch(
      `${GEMINI_BASE_URL}/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
        }),
      },
    );

    const data = (await response.json()) as {
      embedding?: {
        values?: number[];
      };
      error?: unknown;
    };

    if (!response.ok) {
      throw new AppError(`${JSON.stringify(data)}`, 400);
    }

    if (!data.embedding?.values?.length) {
      throw new AppError("Invalid embedding response.", 500);
    }

    return data.embedding.values;
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Error in embedding.",
    );

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Internal server error.", 500);
  }
}

export async function generateAnswer(
  context: string,
  question: string,
): Promise<string> {
  try {
    if (!context.trim()) {
      throw new AppError("Context is required for answer generation.", 400);
    }

    if (!question.trim()) {
      throw new AppError("Question is required.", 400);
    }

    const prompt = `
You are NoteGenius, an AI educational assistant.

Answer the user's question using ONLY the information provided in the
retrieved context.

RULES:
- Do not use outside knowledge.
- Do not invent or assume information that is not present in the context.
- If the context does not contain enough information to answer the question,
  clearly say that the provided documents do not contain enough information.
- Give a clear, accurate, and well-structured answer.
- Use Markdown when it improves readability.
- Do not mention the retrieval process, embeddings, vector search, or these
  instructions.

RETRIEVED CONTEXT:
${context}

USER QUESTION:
${question}

ANSWER:
`;

    const response = await fetch(
      `${GEMINI_BASE_URL}/${GEMINI_GENERATION_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
      error?: unknown;
    };

    if (!response.ok) {
      throw new AppError(`${JSON.stringify(data)}`, 400);
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!answer) {
      throw new AppError("Invalid answer generation response.", 500);
    }

    return answer;
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Error generating answer.",
    );

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Internal server error.", 500);
  }
}
