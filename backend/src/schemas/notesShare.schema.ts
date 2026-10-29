import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { noteTable } from "./note.schema.js";
import { userTable } from "./user.schema.js";

export const noteShareTable = pgTable(
  "note_shares",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    publicId: uuid("public_id")
      .default(sql`gen_random_uuid()`)
      .notNull()
      .unique(),

    noteId: bigint("note_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => noteTable.internalId, {
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
      "note_shares_revoked_at_check",
      sql`${table.revokedAt} IS NULL OR ${table.revokedAt} >= ${table.createdAt}`,
    ),
  ],
);
