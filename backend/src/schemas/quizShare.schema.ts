import {
  pgTable,
  bigserial,
  uuid,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { quizTable } from "./quiz.schema.js";
import { userTable } from "./user.schema.js";

export const quizShareTable = pgTable(
  "quiz_shares",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    publicId: uuid("public_id")
      .default(sql`gen_random_uuid()`)
      .notNull()
      .unique(),

    quizId: uuid("quiz_public_id")
      .notNull()
      .references(() => quizTable.publicId, {
        onDelete: "cascade",
      }),

    recipientUserId: uuid("recipient_user_public_id")
      .notNull()
      .references(() => userTable.publicId, {
        onDelete: "restrict",
      }),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    revokedAt: timestamp("revoked_at", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (table) => [
    check(
      "quiz_shares_revoked_at_check",
      sql`${table.revokedAt} IS NULL OR ${table.revokedAt} >= ${table.createdAt}`,
    ),
  ],
);
