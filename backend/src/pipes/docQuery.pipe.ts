import { sql } from "drizzle-orm";
import db from "@/index.js";
import { documentVectorTable } from "@schemas/documentVector.schema";
import { embedText, generateAnswer } from "./embedding.pipe.js";

export async function queryDocument(question: string) {
  const questionEmbedding = await embedText(question);

  const vector = `[${questionEmbedding.join(",")}]`;

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
    .orderBy(
      sql`
        ${documentVectorTable.embedding}::halfvec(3072)
        <=>
        ${vector}::halfvec(3072)
      `,
    )
    .limit(5);

  if (rows.length === 0) {
    return {
      answer: "No relevant documents found.",
      sources: [],
      topSimilarity: "0.000",
    };
  }

  const context = rows.map((row) => row.chunkText).join("\n\n---\n\n");

  const answer = await generateAnswer(context, question);

  return {
    answer,

    sources: rows.map((row) => ({
      documentId: row.documentId,
      chunkIndex: row.chunkIndex,
    })),

    topSimilarity: Number(rows[0]?.similarity ?? 0).toFixed(3),
  };
}
