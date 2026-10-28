# NoteGenius — User Database Schema

**Version:** 1.0  
**Status:** Confirmed  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM  
**Domain:** Users  
**Last Updated:** 2026-10-28

---

## 1. Purpose

This document defines the proposed PostgreSQL schema for the NoteGenius user domain.

The `users` table is responsible for storing user identity, authentication credentials, profile information, account status, email verification state, login activity, handle-change tracking, and soft-deletion metadata.

The schema follows these principles:

- Use an internal primary key for database relationships.
- Expose UUID-based public identifiers through APIs.
- Keep display names separate from unique user handles.
- Enforce uniqueness at the database level where required.
- Keep authentication credentials secure.
- Use timezone-aware timestamps.
- Support account suspension, email verification, and soft deletion.
- Maintain `updated_at` automatically through a PostgreSQL trigger.

## 2. Table definition

### 2.1 `users`

| Column                   | PostgreSQL type | Constraints                                   | Purpose                                        |
| ------------------------ | --------------- | --------------------------------------------- | ---------------------------------------------- |
| `internal_id`            | `BIGSERIAL`     | Primary key                                   | Internal identifier for database relationships |
| `public_id`              | `UUID`          | Not null, unique, default `gen_random_uuid()` | Public identifier exposed through APIs         |
| `username`               | `VARCHAR(50)`   | Not null                                      | User's display name; duplicates allowed        |
| `user_handle`            | `VARCHAR(30)`   | Not null, unique                              | Unique sharing identity, stored without `@`    |
| `email`                  | `VARCHAR(255)`  | Not null                                      | Normalized email address                       |
| `password_hash`          | `TEXT`          | Not null                                      | Securely hashed password                       |
| `account_status`         | `VARCHAR(30)`   | Not null, check constraint                    | Account lifecycle and access status            |
| `email_verified_at`      | `TIMESTAMPTZ`   | Nullable                                      | Time of successful email verification          |
| `last_login_at`          | `TIMESTAMPTZ`   | Nullable                                      | Time of the latest successful login            |
| `user_handle_changed_at` | `TIMESTAMPTZ`   | Nullable                                      | Time of the latest successful handle change    |
| `created_at`             | `TIMESTAMPTZ`   | Not null, default `NOW()`                     | Record creation timestamp                      |
| `updated_at`             | `TIMESTAMPTZ`   | Not null, default `NOW()`                     | Timestamp of the latest row update             |
| `deleted_at`             | `TIMESTAMPTZ`   | Nullable                                      | Soft-deletion timestamp                        |

## 3. Column specifications

### 3.1 Internal and public identifiers

**`internal_id`**

- Uses `BIGSERIAL PRIMARY KEY`.
- Serves as the stable internal identifier for foreign-key relationships.
- Is not exposed as the public resource identifier in API responses.

**`public_id`**

- Uses PostgreSQL's `gen_random_uuid()` function for default UUID generation.
- Must be unique and non-null.
- Is used to identify resources in public API requests and responses.
- Does not replace authorization checks; possession of a UUID does not grant access.

### 3.2 User profile

**`username`**

- Required during registration.
- Maximum length: 50 characters.
- Leading and trailing whitespace is trimmed by the backend.
- Empty or whitespace-only values are rejected.
- Duplicate display names are permitted.
- No database `CHECK` constraint is required for its format.

**`user_handle`**

- Required during registration.
- Must be unique across all user records, including soft-deleted accounts.
- Stored without the `@` prefix; the UI adds the prefix when displaying it.
- Allowed format: lowercase letters (`a-z`), digits (`0-9`), and underscores (`_`).
- Length: 3–30 characters.
- Format validation is performed by the backend.
- Database constraints enforce `NOT NULL` and uniqueness.

#### Handle-change policy

- The initial handle can be changed without a cooldown.
- After the first successful change, subsequent changes require a 30-day cooldown.
- `user_handle_changed_at` remains `NULL` until the first successful change.
- The backend validates the cooldown and handle uniqueness.
- Updating the handle and its change timestamp must happen atomically.
- `updated_at` is also refreshed by the database trigger.

### 3.3 Email and authentication

**`email`**

- Required during registration.
- Normalized to lowercase by the backend.
- Must be unique regardless of letter casing.
- Uses a unique expression index on `LOWER(email)` rather than a plain unique constraint on `email`.

**`password_hash`**

- Stores only the result of a secure password-hashing algorithm, such as Argon2id.
- Plaintext passwords must never be stored.
- Password hashing and verification occur in the backend authentication layer.

**`last_login_at`**

- Nullable until the first successful login.
- Updated after every successful login.
- Must not be updated after a failed login attempt.
- Does not replace a dedicated security audit log if detailed authentication-event history is later required.

### 3.4 Account status and email verification

The `account_status` column supports exactly three values:

| Status                 | Meaning                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `active`               | Account is eligible for normal access, subject to authorization checks |
| `pending_verification` | Account has not completed the required email-verification workflow     |
| `suspended`            | Account access is blocked by the application's account policy          |

The database will enforce these allowed values using a `VARCHAR` column and a `CHECK` constraint.

**`email_verified_at`**

- Is nullable.
- Remains `NULL` until email verification succeeds.
- Records the verification timestamp.
- Is retained if an already-verified account is subsequently suspended.

The backend must enforce access restrictions and maintain consistency between account status and email verification state.

**Pending decision:** The default `account_status` for new registrations has not yet been finalized. The recommended choice is `pending_verification` if email verification is required before normal access.

### 3.5 Soft deletion

**`deleted_at`**

- Is `NULL` for accounts that have not been soft-deleted.
- Stores the soft-deletion timestamp when an account is deleted.
- Does not, by itself, permanently erase user data.

Application behavior:

- Deleted accounts must be rejected by authentication and authorization checks.
- Normal user queries should exclude soft-deleted accounts unless explicitly needed for recovery or administration.
- Email addresses and handles remain reserved until permanent deletion.
- Permanent deletion must account for related records, foreign keys, storage objects, and applicable retention requirements.

The exact recovery, retention, and permanent-purge workflow remains to be designed.

### 3.6 Timestamps

All timestamps use `TIMESTAMPTZ` to preserve timezone-aware values.

- `created_at`: initialized using `DEFAULT NOW()`.
- `updated_at`: initialized using `DEFAULT NOW()` and automatically refreshed by a PostgreSQL `BEFORE UPDATE` trigger.
- `last_login_at`: tracks successful login activity.
- `email_verified_at`: tracks email verification.
- `user_handle_changed_at`: tracks the most recent successful handle change.
- `deleted_at`: tracks soft deletion.

The general `updated_at` field is not a substitute for the dedicated handle-change or verification timestamps.

## 4. Database constraints and indexes

### 4.1 Primary key and unique constraints

- `users.internal_id`: primary key.
- `users.public_id`: unique and not null.
- `users.user_handle`: unique and not null.
- `users.email`: not null, with case-insensitive uniqueness enforced by an expression index.

### 4.2 Email uniqueness index

```sql
CREATE UNIQUE INDEX users_email_lower_unique_idx
ON users (LOWER(email));
```

This prevents addresses such as `User@example.com` and `user@example.com` from being registered as separate accounts.

The backend should normalize email addresses to lowercase before storing or comparing them.

### 4.3 Account-status constraint

```sql
CHECK (
    account_status IN (
        'active',
        'pending_verification',
        'suspended'
    )
)
```

The column will use `VARCHAR(30) NOT NULL`. Its default will be set after the registration-status decision is confirmed.

### 4.4 Handle format validation

The database will not have a format `CHECK` constraint for `user_handle`. The backend validates the agreed regular expression:

```regex
^[a-z0-9_]{3,30}$
```

Database uniqueness remains mandatory even when validation is performed in the application.

## 5. Automatic `updated_at` maintenance

A reusable PostgreSQL trigger function will update `updated_at` whenever a row is updated.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Attach the trigger to `users`:

```sql
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

This provides consistent timestamp maintenance for application updates and direct database updates.

The migration must create the trigger function before creating the trigger.

## 6. Soft-deletion and uniqueness policy

Soft-deleted users retain their email and handle reservations.

Therefore:

- The email expression index covers all rows, including soft-deleted rows.
- The unique handle constraint covers all rows, including soft-deleted rows.
- Partial unique indexes that exclude deleted accounts are not required.
- Account recovery must not create a second user with the same reserved email or handle.

Permanent deletion requires a separate policy for dependent records and retained data before the original row can be physically removed.

## 7. Security considerations

- Never store plaintext passwords.
- Use a modern password-hashing algorithm with appropriate parameters.
- Derive the authenticated user identity from validated authentication credentials, not from client-supplied ownership identifiers.
- Block suspended and soft-deleted accounts from normal access.
- Validate handle changes and enforce cooldowns on the backend.
- Do not reveal password hashes or sensitive authentication data through user APIs.
- Apply authorization checks independently of public UUIDs.
- Use database transactions for operations that must update multiple related fields atomically.

## 8. Implementation notes

- Implement the schema through version-controlled database migrations.
- Use Drizzle ORM for schema definitions and database access.
- Preserve database-level unique constraints even when the backend performs preliminary validation.
- Handle unique-constraint violations gracefully, including concurrent registrations and handle changes.
- Use transactions for handle updates and related timestamp changes.
- Add appropriate indexes for frequently queried fields based on query patterns; avoid adding indexes without a demonstrated need.
- Verify trigger behavior, uniqueness rules, account-status constraints, and soft-deletion behavior with automated tests.

## 9. Decisions still open

1. **Registration status default:** Confirm whether new accounts begin as `pending_verification` or `active`.
2. **Email verification consistency:** Define the precise backend rules governing `account_status` and `email_verified_at`.
3. **Permanent deletion:** Define retention, recovery, dependency handling, and purge behavior.
4. **Additional indexes:** Determine from query patterns and later API implementation.
5. **Migration and tests:** Translate this reviewed design into Drizzle schema definitions, SQL migrations, and automated tests.
