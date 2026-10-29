import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { userTable } from "./user.schema.js";
import { noteTable } from "./note.schema.js";
import { documentMetaTable } from "./documentMeta.schema.js";

export const quizGenerationModeEnum = pgEnum("quiz_generation_mode", [
  "note",
  "document",
  "topic",
]);

export const quizDifficultyEnum = pgEnum("quiz_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const quizGenerationStatusEnum = pgEnum("quiz_generation_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const quizVisibilityEnum = pgEnum("quiz_visibility", [
  "private",
  "public",
]);

export const quizTable = pgTable(
  "quizzes",
  {
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

    description: text("description"),

    generationMode: quizGenerationModeEnum("generation_mode").notNull(),

    sourceNoteId: bigint("source_note_id", {
      mode: "bigint",
    }).references(() => noteTable.internalId, {
      onDelete: "restrict",
    }),

    sourceDocumentId: bigint("source_document_id", {
      mode: "bigint",
    }).references(() => documentMetaTable.internalId, {
      onDelete: "restrict",
    }),

    sourceTopic: varchar("source_topic", {
      length: 255,
    }),

    requestedQuestionCount: integer("requested_question_count").notNull(),

    difficulty: quizDifficultyEnum("difficulty"),

    generationStatus: quizGenerationStatusEnum("generation_status")
      .default("pending")
      .notNull(),

    generationError: text("generation_error"),

    generatedAt: timestamp("generated_at", {
      mode: "date",
      withTimezone: true,
    }),

    visibility: quizVisibilityEnum("visibility").default("private").notNull(),

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
  },
  (table) => [
    check(
      "quizzes_requested_question_count_check",
      sql`${table.requestedQuestionCount} IN (5, 10, 15)`,
    ),
  ],
);
