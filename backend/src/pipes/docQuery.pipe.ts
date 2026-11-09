import { sql, eq } from "drizzle-orm";
import db from "@/index.js";

import { documentMetaTable } from "@schemas/documentMeta.schema";
import { documentVectorTable } from "@schemas/documentVector.schema";

import { embedText } from "./embedding.pipe.js";
import { AppError } from "@utils/general.util.js";

export async function queryDocument(
  documentPublicId: string,
  question: string,
) {
  /**
   * Resolve and verify the public document UUID.
   */
  const [document] = await db
    .select({
      publicId: documentMetaTable.publicId,
    })
    .from(documentMetaTable)
    .where(eq(documentMetaTable.publicId, documentPublicId))
    .limit(1);

  if (!document) {
    throw new AppError("Document not found.", 404);
  }

  /**
   * Generate the embedding for the user's question.
   */
  const questionEmbedding = await embedText(question);

  const vector = `[${questionEmbedding.join(",")}]`;

  /**
   * Retrieve the most relevant chunks from ONLY this document.
   */
  const rows = await db
    .select({
      documentId: documentVectorTable.documentId,
      chunkIndex: documentVectorTable.chunkIndex,
      chunkText: documentVectorTable.chunkText,

      similarity: sql<number>`
        1 - (
          ${documentVectorTable.embedding}::halfvec(3072)
          <=>
          ${vector}::halfvec(3072)
        )
      `,
    })
    .from(documentVectorTable)
    .where(eq(documentVectorTable.documentId, document.publicId))
    .orderBy(
      sql`
        ${documentVectorTable.embedding}::halfvec(3072)
        <=>
        ${vector}::halfvec(3072)
      `,
    )
    .limit(5);

  /**
   * No chunks were found for this document.
   */
  if (rows.length === 0) {
    return {
      context: "",
      sources: [],
      topSimilarity: "0.000",
    };
  }

  /**
   * Build factual context for the generation service.
   *
   * queryDocument() performs retrieval only.
   */
  const context = rows.map((row) => row.chunkText).join("\n\n---\n\n");

  return {
    context,

    sources: rows.map((row) => ({
      documentPublicId: document.publicId,
      chunkIndex: row.chunkIndex,
      similarity: Number(row.similarity).toFixed(3),
    })),

    topSimilarity: Number(rows[0]?.similarity ?? 0).toFixed(3),
  };
}
