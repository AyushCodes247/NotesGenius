import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userAccountStatusEnum = pgEnum("account_status", [
  "active",
  "pending_verification",
  "suspended",
]);

export const userTable = pgTable(
  "users",
  {
    internalId: bigserial("internal_id", {
      mode: "bigint",
    }).primaryKey(),

    publicId: uuid("public_id")
      .default(sql`gen_random_uuid()`)
      .notNull()
      .unique(),

    username: varchar("username", { length: 50 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    passwordHash: text("password_hash").notNull(),

    userHandle: varchar("user_handle", { length: 30 }).notNull().unique(),

    accountStatus: userAccountStatusEnum("account_status").notNull(),

    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
      mode: "date",
    }),

    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "date",
    }),

    userHandleChangedAt: timestamp("user_handle_changed_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    uniqueIndex("users_email_lower_unique_idx").on(sql`LOWER(${table.email})`),
  ],
);
