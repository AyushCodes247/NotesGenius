import {
  pgTable,
  bigserial,
  uuid,
  timestamp,
  check,
  text,
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

    noteId: uuid("note_public_id")
      .notNull()
      .references(() => noteTable.publicId, {
        onDelete: "cascade",
      }),

    pdfUrl: text("pdf_url"),

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
      "note_shares_revoked_at_check",
      sql`${table.revokedAt} IS NULL OR ${table.revokedAt} >= ${table.createdAt}`,
    ),
  ],
);
