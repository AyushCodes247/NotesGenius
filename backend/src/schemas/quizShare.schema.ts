import {
  pgTable,
  bigserial,
  uuid,
  bigint,
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

    quizId: bigint("quiz_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => quizTable.internalId, {
        onDelete: "cascade",
      }),

    recipientUserId: bigint("recipient_user_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => userTable.internalId, {
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
