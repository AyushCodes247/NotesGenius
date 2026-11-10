import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userTable } from "./user.schema.js";
import { documentMetaTable } from "./documentMeta.schema.js";

export const noteGenerationModeEnum = pgEnum("generation_mode", [
  "document",
  "pasted_text",
  "topic",
]);

export const noteVisibilityEnum = pgEnum("note_visibility", [
  "private",
  "public",
]);

export const noteTable = pgTable("notes", {
  internalId: bigserial("internal_id", {
    mode: "bigint",
  }).primaryKey(),

  publicId: uuid("public_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .unique(),

  userId: uuid("user_public_id")
    .references(() => userTable.publicId)
    .notNull(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  content: text("content").notNull(),

  sourceDocumentId: uuid("document_public_id").references(
    () => documentMetaTable.publicId,
    {
      onDelete: "restrict",
    },
  ),

  sourceText: text("source_text"),

  topic: varchar("topic", {
    length: 255,
  }),

  generationMode: noteGenerationModeEnum("generation_mode").notNull(),

  visibility: noteVisibilityEnum("visibility").notNull(),

  pdfStorageKey: text("pdf_storage_key"),

  pdfUrl: text("pdf_url"),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  deletedAt: timestamp("deleted_at", {
    mode: "date",
    withTimezone: true,
  }),
});
