import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  timestamp,
  bigint,
  pgEnum,
  text,
  char,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userTable } from "./user.schema.js";

export const processingStatusEnum = pgEnum("processing_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const documentMetaTable = pgTable("document_meta", {
  internalId: bigserial("internal_id", { mode: "bigint" }).primaryKey(),

  publicId: uuid("public_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .unique(),

  userId: bigint("user_id", { mode: "bigint" })
    .references(() => userTable.internalId)
    .notNull(),

  originalFileName: varchar("original_filename", { length: 255 }).notNull(),

  mimeType: varchar("mime_type", { length: 100 }).notNull(),

  fileSizeBytes: bigint("file_size_bytes", { mode: "bigint" }).notNull(),

  storageKey: text("storage_key").notNull().unique(),

  checksumSha256: char("checksum_sha256", { length: 64 }).notNull(),

  processingStatus: processingStatusEnum("processing_status")
    .default("pending")
    .notNull(),

  processedAt: timestamp("processed_at", {
    mode: "date",
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
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
