import { documentVectorTable } from "@schemas/documentVector.schema";
import db from "@/index.js";
import { embedText } from "./embedding.pipe.js";
import { extractedPdfText } from "./pdf.pipe.js";

const SUPPORTED_TEXT_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
]);

export async function ingestDocument(
  filePath: string,
  documentId: bigint,
  mimeType: string,
): Promise<number> {
  try {
    if (mimeType === "image/png") {
      throw new Error("Image ingestion is not supported yet.");
    }

    if (!SUPPORTED_TEXT_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported file type for RAG ingestion: ${mimeType}`);
    }

    const chunks = await extractedPdfText(filePath);

    if (chunks.length === 0) {
      throw new Error("No content extracted from document.");
    }

    let processedChunks = 0;

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index]?.trim();

      if (!chunk) {
        continue;
      }

      const embedding = await embedText(chunk);

      await db.insert(documentVectorTable).values({
        documentId,
        chunkIndex: index,
        chunkText: chunk,
        embedding,
      });

      processedChunks++;
    }

    if (processedChunks === 0) {
      throw new Error("No valid content chunks generated from document.");
    }

    return processedChunks;
  } catch (error) {
    console.error("Error while ingesting document:", error);

    throw new Error("Error in document ingestion.");
  }
}
