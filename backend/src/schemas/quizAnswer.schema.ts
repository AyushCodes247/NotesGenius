import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  boolean,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { quizAttemptTable } from "./quizAttempt.schema.js";
import { quizQuestionTable } from "./quizQuestion.schema.js";
import { quizOptionTable } from "./quizOption.schema.js";

export const quizAnswerTable = pgTable(
  "quiz_answers",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    publicId: uuid("public_id")
      .default(sql`gen_random_uuid()`)
      .notNull()
      .unique(),

    attemptId: bigint("attempt_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => quizAttemptTable.internalId, {
        onDelete: "cascade",
      }),

    questionId: bigint("question_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => quizQuestionTable.internalId, {
        onDelete: "restrict",
      }),

    questionOptionId: bigint("question_option_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => quizOptionTable.internalId, {
        onDelete: "restrict",
      }),

    isCorrect: boolean("is_correct").notNull(),

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
    unique("quiz_answers_attempt_option_unique").on(
      table.attemptId,
      table.questionOptionId,
    ),
    index("quiz_answers_attempt_question_idx").on(
      table.attemptId,
      table.questionId,
    ),
  ],
);
