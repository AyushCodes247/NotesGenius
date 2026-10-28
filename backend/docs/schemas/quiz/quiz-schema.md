# NoteGenius — Quiz Schema

**File:** `quiz-schema.md`  
**Version:** 1.0  
**Status:** Confirmed design draft  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM

---

## 1. Purpose

The quiz schema stores reusable quizzes generated from saved notes, uploaded documents, or user-supplied topics.

The `quizzes` table represents the parent entity. Questions and practice attempts are stored separately in `quiz_questions` and `quiz_attempts`, respectively.

This separation supports independent quiz generation, retries, practice history, soft deletion, and future expansion without coupling quiz records to the lifecycle of their source materials.

## 2. Design decisions

- Each quiz has one owner.
- Internal database relationships use `internal_id`; API-facing references use `public_id`.
- Every new quiz generation creates a new quiz record.
- Failed generation can be retried using the existing quiz record.
- A retry does not replace existing questions or modify practice attempts.
- Explicit regeneration is a separate operation and must preserve existing practice history.
- Quiz generation supports the `note`, `document`, and `topic` modes.
- The original topic is retained for topic-generated quizzes.
- The requested question count must be exactly 5, 10, or 15.
- Difficulty and description are optional and editable.
- Quizzes support private and public visibility, defaulting to private.
- Soft deletion preserves questions and attempts.
- Source soft deletion does not automatically delete dependent quizzes.
- Permanent deletion of referenced users, notes, or documents requires explicit dependency resolution.
- Generation errors store sanitized, user-safe summaries rather than raw diagnostic information.

## 3. Table: `quizzes`

### 3.1 PostgreSQL DDL

```sql
CREATE TABLE quizzes (
    internal_id BIGSERIAL PRIMARY KEY,

    public_id UUID NOT NULL UNIQUE
        DEFAULT gen_random_uuid(),

    user_id BIGINT NOT NULL
        REFERENCES users (internal_id)
        ON DELETE RESTRICT,

    title VARCHAR(255) NOT NULL,

    description TEXT NULL,

    generation_mode VARCHAR(30) NOT NULL
        CHECK (
            generation_mode IN (
                'note',
                'document',
                'topic'
            )
        ),

    source_note_id BIGINT NULL
        REFERENCES notes (internal_id)
        ON DELETE RESTRICT,

    source_document_id BIGINT NULL
        REFERENCES document_meta (internal_id)
        ON DELETE RESTRICT,

    source_topic VARCHAR(255) NULL,

    requested_question_count INTEGER NOT NULL
        CHECK (
            requested_question_count IN (5, 10, 15)
        ),

    difficulty VARCHAR(20) NULL
        CHECK (
            difficulty IN ('easy', 'medium', 'hard')
        ),

    generation_status VARCHAR(20) NOT NULL
        DEFAULT 'pending'
        CHECK (
            generation_status IN (
                'pending',
                'processing',
                'completed',
                'failed'
            )
        ),

    generation_error TEXT NULL,

    generated_at TIMESTAMPTZ NULL,

    visibility VARCHAR(10) NOT NULL
        DEFAULT 'private'
        CHECK (
            visibility IN ('private', 'public')
        ),

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    deleted_at TIMESTAMPTZ NULL,

    CONSTRAINT quizzes_source_consistency_check
        CHECK (
            (
                generation_mode = 'note'
                AND source_note_id IS NOT NULL
                AND source_document_id IS NULL
                AND source_topic IS NULL
            )
            OR
            (
                generation_mode = 'document'
                AND source_note_id IS NULL
                AND source_document_id IS NOT NULL
                AND source_topic IS NULL
            )
            OR
            (
                generation_mode = 'topic'
                AND source_note_id IS NULL
                AND source_document_id IS NULL
                AND source_topic IS NOT NULL
            )
        )
);
```

**Implementation note:** The backend must reject blank or whitespace-only titles and topics, trim user-provided values as appropriate, and enforce the 255-character limits. PostgreSQL's `NOT NULL` and length constraints alone do not reject whitespace-only strings.

### 3.2 Column reference

| Column                     | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `internal_id`              | Internal primary key for relationships           |
| `public_id`                | UUID used for external references and API routes |
| `user_id`                  | Quiz owner's internal user ID                    |
| `title`                    | Required, editable quiz title                    |
| `description`              | Optional, editable description                   |
| `generation_mode`          | Indicates the original generation source         |
| `source_note_id`           | Original saved-note reference                    |
| `source_document_id`       | Original uploaded-document reference             |
| `source_topic`             | Original topic for topic-generated quizzes       |
| `requested_question_count` | Requested number of questions: 5, 10, or 15      |
| `difficulty`               | Optional difficulty: easy, medium, or hard       |
| `generation_status`        | Current generation lifecycle state               |
| `generation_error`         | Sanitized failure summary                        |
| `generated_at`             | Latest successful generation completion time     |
| `visibility`               | Private or public access mode                    |
| `created_at`               | Record creation time                             |
| `updated_at`               | Last record modification time                    |
| `deleted_at`               | Soft-deletion timestamp                          |

## 4. Constraints and integrity rules

### 4.1 Identity and ownership

- `internal_id` is the primary key.
- `public_id` is unique and generated by PostgreSQL.
- `user_id` is mandatory and references `users.internal_id`.
- `ON DELETE RESTRICT` prevents permanent deletion of an owner while dependent quizzes remain.
- Authorization must never rely on an unguessable UUID alone.

### 4.2 Source consistency

The `quizzes_source_consistency_check` constraint guarantees that exactly one valid source mode is represented:

| Generation mode | `source_note_id` | `source_document_id` | `source_topic` |
| --------------- | ---------------- | -------------------- | -------------- |
| `note`          | Required         | `NULL`               | `NULL`         |
| `document`      | `NULL`           | Required             | `NULL`         |
| `topic`         | `NULL`           | `NULL`               | Required       |

The source foreign keys use `ON DELETE RESTRICT`. Permanent deletion must explicitly resolve dependent quizzes before deleting the source.

Soft-deleting a note or document does not remove its associated quiz or practice history.

### 4.3 Question count

Only three values are accepted:

- `5`
- `10`
- `15`

The database constraint enforces this restriction independently of backend validation.

The actual number of questions is derived from `quiz_questions`; no redundant generated-question count is stored in this table.

### 4.4 Generation lifecycle

Allowed statuses are:

- `pending`
- `processing`
- `completed`
- `failed`

Recommended lifecycle:

```text
pending → processing → completed
                    ↘ failed → processing → completed
```

The backend and processing service are responsible for valid state transitions.

- `generation_status` represents the current state.
- `generation_error` contains a sanitized, user-safe failure summary when applicable.
- `generated_at` is set on successful generation.
- A successful retry updates `generated_at` and clears `generation_error`.
- `generated_at` remains `NULL` until the first successful generation.

Stack traces, secrets, raw provider responses, and sensitive diagnostic information belong in protected application logs, not `generation_error`.

### 4.5 Difficulty and description

- `description` is nullable and editable.
- `difficulty` is nullable and restricted to `easy`, `medium`, or `hard`.
- The backend may infer the difficulty during generation.
- Users may change the difficulty after creation.
- The database does not require a difficulty value.

### 4.6 Visibility

- New quizzes default to `private`.
- Only `private` and `public` are accepted.
- Private quizzes require owner authorization.
- Public quizzes may be accessed through the explicitly authorized public-access flow.
- Public visibility does not bypass account-status, soft-deletion, or ownership-related eligibility rules.

### 4.7 Timestamps and soft deletion

- `created_at` is generated by PostgreSQL.
- `updated_at` is maintained by the shared `set_updated_at()` trigger.
- `deleted_at` supports soft deletion and restoration.
- Soft-deleted quizzes are excluded from normal queries and access paths.
- Restoring a quiz clears `deleted_at`.
- Soft deletion does not delete questions or attempts.
- A separate `completed_at` column is not needed on `quizzes`; practice completion belongs to individual `quiz_attempts` records.
- No `updated_by_user_id` column is included.

## 5. Indexes

The following indexes support owner queries, source lookups, public quiz access, and generation-job processing.

```sql
CREATE INDEX quizzes_user_created_idx
ON quizzes (user_id, created_at DESC)
WHERE deleted_at IS NULL;
```

```sql
CREATE INDEX quizzes_source_note_idx
ON quizzes (source_note_id)
WHERE source_note_id IS NOT NULL;
```

```sql
CREATE INDEX quizzes_source_document_idx
ON quizzes (source_document_id)
WHERE source_document_id IS NOT NULL;
```

```sql
CREATE INDEX quizzes_public_active_idx
ON quizzes (created_at DESC)
WHERE visibility = 'public'
  AND deleted_at IS NULL;
```

```sql
CREATE INDEX quizzes_generation_queue_idx
ON quizzes (created_at)
WHERE generation_status IN ('pending', 'processing')
  AND deleted_at IS NULL;
```

The generation-queue index is intended for processing workflows that claim pending work or inspect in-progress jobs. The exact query patterns should be validated with `EXPLAIN ANALYZE` before production deployment.

## 6. Related tables

The quiz parent table is designed to work with two separate tables.

### 6.1 `quiz_questions`

Stores individual generated questions and their associated answer data.

The question schema must define question types, ordering, answer options, correct answers, explanations, and ownership of question-level data. These details belong in the separate question schema rather than being embedded in `quizzes`.

### 6.2 `quiz_attempts`

Stores each practice attempt independently.

Attempt-level data should capture the quiz being practiced, the participating user, answers submitted, scoring, attempt status, and completion timestamps as required by the practice workflow.

A quiz can have multiple attempts without changing its generation metadata.

## 7. Authorization and lifecycle behavior

| Scenario                                   | Expected behavior                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| Owner accesses a private quiz              | Allowed when the owner and quiz are eligible                                |
| Other user accesses a private quiz         | Denied unless a separately authorized access policy permits it              |
| User accesses a public quiz                | Allowed through the defined public-access flow when eligibility checks pass |
| Quiz is soft-deleted                       | Normal access is blocked                                                    |
| Quiz is restored                           | Access resumes according to visibility and authorization                    |
| Owner is suspended                         | Quiz access is blocked while the owner is ineligible                        |
| Owner is soft-deleted                      | Quiz access is blocked while the owner is ineligible                        |
| Source note is soft-deleted                | Quiz and history remain stored                                              |
| Source document is soft-deleted            | Quiz and history remain stored                                              |
| Source is permanently deleted              | Explicitly resolve dependent quizzes first                                  |
| Owner is permanently deleted               | Explicitly resolve dependent quizzes first                                  |
| Generation fails                           | Preserve the quiz record and store a sanitized failure summary              |
| Generation is retried                      | Reuse the same quiz record                                                  |
| Retry succeeds                             | Update `generated_at`; clear `generation_error`                             |
| New quiz is generated from the same source | Create a new quiz record                                                    |

Authorization checks must be enforced by the backend, not merely by frontend visibility controls.

## 8. Operational considerations

1. Use transactions where a generation operation creates or updates multiple related records.
2. Ensure processing workers handle retries safely and avoid duplicate question creation.
3. Preserve existing question and attempt history when retrying generation.
4. Treat explicit regeneration as a separate operation with a documented history-preservation policy.
5. Exclude soft-deleted quizzes from normal application queries.
6. Keep error summaries safe for display and diagnostic logs access-controlled.
7. Validate database indexes against actual query patterns and production-like data volumes.
8. Implement the schema through version-controlled database migrations managed alongside the Drizzle ORM models.

## 9. Out of scope

This document defines the parent `quizzes` table and its lifecycle rules. It does not finalize:

- The complete `quiz_questions` schema.
- The complete `quiz_attempts` schema.
- Question types and answer-option representation.
- Attempt scoring and answer-evaluation rules.
- Detailed audit-history storage.
- The complete API contract for quiz creation, retry, regeneration, and public access.

These concerns should be documented in their respective design documents before implementation.

---

**Document status:** Confirmed design draft, version 1.0.

The DDL and indexes should be translated into Drizzle ORM definitions and migrations, then validated through schema tests and migration review before deployment.
