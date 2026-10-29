import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  integer,
  text,
  timestamp,
  check,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { quizQuestionTable } from "./quizQuestion.schema.js";

export const quizOptionTable = pgTable(
  "quiz_options",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    publicId: uuid("public_id")
      .default(sql`gen_random_uuid()`)
      .notNull()
      .unique(),

    questionId: bigint("question_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => quizQuestionTable.internalId, {
        onDelete: "cascade",
      }),

    optionNumber: integer("option_number").notNull(),

    optionText: text("option_text").notNull(),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("quiz_options_option_number_check", sql`${table.optionNumber} >= 1`),
    unique("quiz_options_question_option_number_unique").on(
      table.questionId,
      table.optionNumber,
    ),
  ],
);
