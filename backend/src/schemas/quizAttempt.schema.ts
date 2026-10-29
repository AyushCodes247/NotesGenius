import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  integer,
  numeric,
  timestamp,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { quizTable } from "./quiz.schema.js";
import { userTable } from "./user.schema.js";

export const quizAttemptStatusEnum = pgEnum("quiz_attempt_status", [
  "in_progress",
  "submitted",
  "abandoned",
]);

export const quizAttemptTable = pgTable(
  "quiz_attempts",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    publicId: uuid("public_id")
      .default(sql`gen_random_uuid()`)
      .notNull()
      .unique(),

    quizId: bigint("quiz_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => quizTable.internalId, {
        onDelete: "restrict",
      }),

    userId: bigint("user_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => userTable.internalId, {
        onDelete: "restrict",
      }),

    status: quizAttemptStatusEnum("status").notNull().default("in_progress"),

    startedAt: timestamp("started_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    submittedAt: timestamp("submitted_at", {
      mode: "date",
      withTimezone: true,
    }),

    score: integer("score"),

    totalQuestions: integer("total_questions").notNull(),

    scorePercentage: numeric("score_percentage", {
      precision: 5,
      scale: 2,
    }),

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
  },
  (table) => [
    check(
      "quiz_attempts_score_check",
      sql`${table.score} IS NULL OR ${table.score} >= 0`,
    ),

    check(
      "quiz_attempts_total_questions_check",
      sql`${table.totalQuestions} > 0`,
    ),

    check(
      "quiz_attempts_score_percentage_check",
      sql`${table.scorePercentage} IS NULL OR (${table.scorePercentage} >= 0 AND ${table.scorePercentage} <= 100)`,
    ),
  ],
);
