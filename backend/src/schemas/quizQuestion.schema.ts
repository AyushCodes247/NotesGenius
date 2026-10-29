import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  integer,
  text,
  timestamp,
  pgEnum,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { quizTable } from "./quiz.schema.js";

export const quizQuestionTypeEnum = pgEnum("quiz_question_type", [
  "multiple_choice",
]);

export const quizQuestionTable = pgTable(
  "quiz_questions",
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
        onDelete: "cascade",
      }),

    questionNumber: integer("question_number").notNull(),

    questionType: quizQuestionTypeEnum("question_type").notNull(),

    questionText: text("question_text").notNull(),

    explanation: text("explanation"),

    hint: text("hint"),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "quiz_questions_question_number_check",
      sql`${table.questionNumber} >= 1`,
    ),
    unique("quiz_questions_quiz_question_number_unique").on(
      table.quizId,
      table.questionNumber,
    ),
  ],
);
