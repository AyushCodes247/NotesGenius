import logger from "@/utils/logger.util.js";
import { PDFParse } from "pdf-parse";

function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50,
): string[] {
  const chunks: string[] = [];

  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    const chunk = text.slice(start, end).trim();

    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

export async function extractedPdfText(filePath: string): Promise<string[]> {
  const parser = new PDFParse({
    url: filePath,
  });

  try {
    const { text } = await parser.getText();

    return chunkText(text);
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Error while parsing PDF.",
    );

    throw new Error("Failed to process PDF.", { cause: error });
  } finally {
    await parser.destroy();
  }
}
