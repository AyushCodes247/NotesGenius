# Quiz Shares Schema

**Project:** NoteGenius  
**Document:** `quiz-shares-schema.md`  
**Version:** 1.0  
**Status:** Confirmed design draft  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM

---

## 1. Purpose

The `quiz_shares` table manages direct, user-to-user sharing of quizzes.

A quiz owner can grant another eligible user view-only access to a quiz. The owner can revoke that access without deleting the quiz or its historical share record.

This table supports:

- Sharing a quiz with a user identified by their account.
- Restricting access to eligible recipients.
- Revoking access while preserving share history.
- Sharing the same quiz again after a previous share is revoked.
- Preventing duplicate active shares between the same quiz and recipient.
- Enforcing access rules when the quiz owner or recipient becomes suspended or soft-deleted.

Public quiz visibility remains separate from direct sharing. A public quiz does not require a `quiz_shares` record to be accessible under its public-visibility rules.

## 2. Table Definition

### `quiz_shares`

| Column              | PostgreSQL type | Constraints                                       | Purpose                                                                             |
| ------------------- | --------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `internal_id`       | `BIGSERIAL`     | Primary key                                       | Internal identifier for joins and database operations.                              |
| `public_id`         | `UUID`          | `NOT NULL`, `UNIQUE`, default `gen_random_uuid()` | Public identifier for the share record.                                             |
| `quiz_id`           | `BIGINT`        | `NOT NULL`, FK to `quizzes.internal_id`           | Identifies the shared quiz.                                                         |
| `recipient_user_id` | `BIGINT`        | `NOT NULL`, FK to `users.internal_id`             | Identifies the user receiving access.                                               |
| `created_at`        | `TIMESTAMPTZ`   | `NOT NULL`, default `NOW()`                       | Records when the share was created.                                                 |
| `revoked_at`        | `TIMESTAMPTZ`   | Nullable                                          | Records when the owner revoked access. `NULL` means the share has not been revoked. |

No `updated_at`, `deleted_at`, permission column, revoker column, or `previous_share_id` is required.

## 3. SQL Definition

```sql
CREATE TABLE quiz_shares (
    internal_id BIGSERIAL PRIMARY KEY,

    public_id UUID NOT NULL UNIQUE
        DEFAULT gen_random_uuid(),

    quiz_id BIGINT NOT NULL
        REFERENCES quizzes(internal_id)
        ON DELETE CASCADE,

    recipient_user_id BIGINT NOT NULL
        REFERENCES users(internal_id)
        ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    revoked_at TIMESTAMPTZ NULL,

    CONSTRAINT chk_quiz_shares_revoked_at
        CHECK (
            revoked_at IS NULL
            OR revoked_at >= created_at
        )
);

CREATE UNIQUE INDEX uq_quiz_shares_active_recipient
    ON quiz_shares (quiz_id, recipient_user_id)
    WHERE revoked_at IS NULL;

CREATE INDEX idx_quiz_shares_quiz_created
    ON quiz_shares (quiz_id, created_at DESC);

CREATE INDEX idx_quiz_shares_recipient
    ON quiz_shares (recipient_user_id);
```

## 4. Relationships and Deletion Policies

### 4.1 Quiz relationship

- Each share belongs to exactly one quiz.
- A quiz can have multiple share records for different recipients.
- Permanent deletion of a quiz cascades to its share records.
- Soft deletion of a quiz does not trigger cascading deletion.
- A soft-deleted quiz cannot be accessed through its shares until the quiz becomes eligible for access again.

### 4.2 Recipient relationship

- Each share targets exactly one recipient.
- A recipient can receive shares for multiple quizzes.
- The recipient foreign key uses `ON DELETE RESTRICT`.
- Before permanently deleting a recipient account, the account-deletion workflow must resolve dependent share records. Under the confirmed policy, dependent shares are deleted before permanent recipient deletion, accepting the resulting loss of those share-history records.

### 4.3 Quiz owner relationship

The owner is derived through the referenced quiz. No separate `owner_user_id` column is needed.

Only the quiz owner may create or revoke shares. The backend must verify ownership using the authenticated user and the quiz's ownership relationship.

## 5. Active Share Uniqueness

The partial unique index:

```sql
CREATE UNIQUE INDEX uq_quiz_shares_active_recipient
    ON quiz_shares (quiz_id, recipient_user_id)
    WHERE revoked_at IS NULL;
```

ensures that only one active share can exist for a given quiz-recipient pair.

This permits the following lifecycle:

1. The owner shares a quiz with a recipient.
2. The recipient receives view-only access.
3. The owner revokes the share by setting `revoked_at`.
4. The owner may share the quiz with that recipient again.
5. The new sharing period creates a separate row with a new `internal_id` and `public_id`.

Previously revoked records remain available for historical reference unless removed by an applicable permanent-deletion workflow.

## 6. Revocation Rules

Revocation is represented by setting `revoked_at` to the revocation timestamp.

Example:

```sql
UPDATE quiz_shares
SET revoked_at = NOW()
WHERE quiz_id = $1
  AND recipient_user_id = $2
  AND revoked_at IS NULL;
```

The backend must verify that the authenticated user owns the quiz before performing this operation.

Revocation should be idempotent at the API level: repeating a revoke request must not restore access or create another active share.

The database check constraint prevents a revocation timestamp earlier than the share creation timestamp.

## 7. Recipient Eligibility and Access Control

### Creating a share

A recipient must satisfy both conditions:

- `account_status = 'active'`
- `deleted_at IS NULL`

The backend rejects attempts to share a quiz with a suspended or soft-deleted recipient. It also rejects self-sharing, where the recipient is the quiz owner. Self-sharing is enforced through backend validation rather than a database constraint.

### Accessing a shared quiz

Access is denied when any of the following applies:

- The share has been revoked.
- The quiz is soft-deleted or otherwise ineligible for access.
- The quiz owner is suspended or soft-deleted.
- The recipient is suspended or soft-deleted.

If the quiz, owner, and recipient become eligible again, an existing share restores access automatically provided `revoked_at IS NULL`.

No additional status column is needed in `quiz_shares`; eligibility is evaluated against the current state of the related records.

## 8. Visibility and Permissions

Direct sharing and public visibility are independent mechanisms.

- **Private quiz:** Access is limited to the owner and eligible users with an active share, subject to authorization rules.
- **Public quiz:** Access follows the application's public-visibility policy.
- **Revoked share:** The recipient no longer has access through that share, even if the quiz remains public or is shared again later.

Sharing grants view-only access. It does not transfer ownership or permit recipients to edit the original quiz, its questions, answer keys, or settings.

## 9. Indexes and Query Patterns

| Index                                                                  | Purpose                                                                      |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Primary key on `internal_id`                                           | Internal row identification.                                                 |
| Unique constraint on `public_id`                                       | Public share identifier uniqueness.                                          |
| Partial unique index on `(quiz_id, recipient_user_id)` for active rows | Prevents duplicate active grants while allowing re-sharing after revocation. |
| Index on `(quiz_id, created_at DESC)`                                  | Retrieves a quiz's share history in chronological order, newest first.       |
| Index on `(recipient_user_id)`                                         | Supports retrieving incoming shares for a recipient.                         |

PostgreSQL automatically indexes primary-key and unique constraints. The partial unique index does not replace the history index because revoked rows are excluded from its uniqueness condition.

## 10. API Considerations

The confirmed API operations are:

| Operation    | Endpoint                                          | Purpose                                              |
| ------------ | ------------------------------------------------- | ---------------------------------------------------- |
| Create share | `POST /api/v1/quizzes/{quizId}/shares`            | Grant an eligible recipient view-only access.        |
| Revoke share | `DELETE /api/v1/quizzes/{quizId}/shares/{userId}` | Revoke the active share for the specified recipient. |

The backend must:

- Authenticate the caller.
- Verify quiz ownership.
- Validate recipient eligibility.
- Reject self-sharing.
- Prevent duplicate active shares.
- Apply revocation without deleting the share row.
- Enforce recipient access on every protected request.

The API should use the recipient's public account identifier or handle at its external boundary as appropriate, then resolve it to the internal user ID. The database stores `recipient_user_id` as a foreign key.

## 11. Security and Operational Considerations

- Do not trust client-supplied ownership or recipient eligibility claims.
- Check share status and related account/resource eligibility at authorization time.
- Do not treat a previously valid share as permanently authorized if the owner, recipient, or quiz later becomes ineligible.
- Use transactions where necessary to coordinate share creation with eligibility checks and related operations.
- Treat unique-constraint violations from concurrent share requests as a duplicate active-share outcome.
- Preserve revoked records for history; do not reuse old rows for a new sharing period.

## 12. Design Decisions Summary

| Decision                                | Confirmed choice                                 |
| --------------------------------------- | ------------------------------------------------ |
| Sharing model                           | Separate `quiz_shares` table                     |
| Permission model                        | View-only                                        |
| Resource relationship                   | `quiz_id` with `ON DELETE CASCADE`               |
| Recipient relationship                  | `recipient_user_id` with `ON DELETE RESTRICT`    |
| Identifiers                             | `internal_id` and unique `public_id`             |
| Creation timestamp                      | `created_at`                                     |
| Revocation                              | Nullable `revoked_at`                            |
| Revocation validation                   | `revoked_at IS NULL OR revoked_at >= created_at` |
| Duplicate active shares                 | Partial unique index                             |
| Re-sharing                              | New independent row                              |
| Self-sharing                            | Backend validation                               |
| Recipient eligibility                   | Active and not soft-deleted                      |
| Owner eligibility                       | Evaluated when authorizing access                |
| Soft deletion                           | Retain share row; deny access while ineligible   |
| Share history                           | Retain revoked records                           |
| Permission/revoker/history-link columns | Not included                                     |
| Public visibility                       | Separate from direct sharing                     |

## 13. Status

**Status: Confirmed design draft.**

This schema follows the confirmed direct-sharing model used by `note_shares`, adapted to quizzes. Before implementation, ensure the account status and soft-deletion fields match the actual `users` schema and that all ownership and eligibility checks are enforced by the backend.
