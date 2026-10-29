import {
  pgTable,
  bigserial,
  bigint,
  integer,
  text,
  unique,
  check,
  customType,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { documentMetaTable } from "./documentMeta.schema.js";

const vector = customType<{
  data: number[];
  driverData: string;
}>({
  dataType() {
    return "vector(3072)";
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value) {
    return value.slice(1, -1).split(",").map(Number);
  },
});

export const documentVectorTable = pgTable(
  "document_vector",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    documentId: bigint("document_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => documentMetaTable.internalId, {
        onDelete: "cascade",
      }),

    chunkIndex: integer("chunk_index").notNull(),

    chunkText: text("chunk_text").notNull(),

    embedding: vector("embedding").notNull(),
  },
  (table) => [
    check("document_vector_chunk_index_check", sql`${table.chunkIndex} >= 0`),

    unique("document_vector_document_chunk_unique").on(
      table.documentId,
      table.chunkIndex,
    ),

    index("document_vector_embedding_hnsw_idx").using(
      "hnsw",
      sql`${table.embedding} vector_cosine_ops`,
    ),
  ],
);
