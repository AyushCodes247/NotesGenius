import {
  pgTable,
  bigserial,
  uuid,
  bigint,
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

  userId: bigint("user_id", {
    mode: "bigint",
  })
    .notNull()
    .references(() => userTable.internalId, {
      onDelete: "restrict",
    }),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  content: text("content").notNull(),

  sourceDocumentId: bigint("source_document_id", {
    mode: "bigint",
  }).references(() => documentMetaTable.internalId, {
    onDelete: "restrict",
  }),

  sourceText: text("source_text"),

  topic: varchar("topic", {
    length: 255,
  }),

  generationMode: noteGenerationModeEnum("generation_mode").notNull(),

  visibility: noteVisibilityEnum("visibility").notNull(),

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
