# Quiz Attempt Schema

**Project:** NoteGenius  
**Document:** `quiz-attempt-schema.md`  
**Version:** 1.0  
**Status:** Confirmed design draft  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM

---

## 1. Purpose

The `quiz_attempts` table stores each learner's individual attempt at a quiz.

A quiz is a reusable resource. Each time a learner starts that quiz, a separate attempt record is created. This preserves attempt history and allows learners to review previous results independently.

The table is responsible for:

- Identifying the quiz and learner associated with an attempt.
- Tracking attempt status and lifecycle timestamps.
- Recording the final score and percentage.
- Supporting multiple attempts for the same quiz.
- Providing the parent relationship for `quiz_answers`.
- Preserving submitted results through backend-enforced immutability.

## 2. Table Definition

### `quiz_attempts`

| Column             | PostgreSQL type | Constraints                                       | Purpose                                         |
| ------------------ | --------------- | ------------------------------------------------- | ----------------------------------------------- |
| `internal_id`      | `BIGSERIAL`     | Primary key                                       | Internal identifier for joins and foreign keys. |
| `public_id`        | `UUID`          | `NOT NULL`, `UNIQUE`, default `gen_random_uuid()` | Public identifier for API resources.            |
| `quiz_id`          | `BIGINT`        | `NOT NULL`, FK to `quizzes.internal_id`           | Identifies the quiz being attempted.            |
| `user_id`          | `BIGINT`        | `NOT NULL`, FK to `users.internal_id`             | Identifies the learner taking the quiz.         |
| `status`           | `VARCHAR(30)`   | `NOT NULL`, `CHECK` constraint                    | Tracks the attempt lifecycle.                   |
| `started_at`       | `TIMESTAMPTZ`   | `NOT NULL`, default `NOW()`                       | Records when the attempt begins.                |
| `submitted_at`     | `TIMESTAMPTZ`   | Nullable                                          | Records when the attempt is submitted.          |
| `score`            | `INTEGER`       | Nullable, `CHECK (score >= 0)`                    | Final number of correctly answered questions.   |
| `total_questions`  | `INTEGER`       | `NOT NULL`, `CHECK (total_questions > 0)`         | Number of questions included in the attempt.    |
| `score_percentage` | `NUMERIC(5,2)`  | Nullable, range 0–100                             | Final percentage score.                         |
| `created_at`       | `TIMESTAMPTZ`   | `NOT NULL`, default `NOW()`                       | Record creation timestamp.                      |
| `updated_at`       | `TIMESTAMPTZ`   | `NOT NULL`, default `NOW()`                       | Last record update timestamp.                   |

### Suggested SQL definition

```sql
CREATE TABLE quiz_attempts (
    internal_id BIGSERIAL PRIMARY KEY,

    public_id UUID NOT NULL UNIQUE
        DEFAULT gen_random_uuid(),

    quiz_id BIGINT NOT NULL
        REFERENCES quizzes(internal_id)
        ON DELETE CASCADE,

    user_id BIGINT NOT NULL
        REFERENCES users(internal_id)
        ON DELETE RESTRICT,

    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'in_progress',
                'submitted',
                'abandoned'
            )
        ),

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ NULL,

    score INTEGER NULL
        CHECK (score >= 0),

    total_questions INTEGER NOT NULL
        CHECK (total_questions > 0),

    score_percentage NUMERIC(5,2) NULL
        CHECK (
            score_percentage >= 0
            AND score_percentage <= 100
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_quiz_attempts_internal_quiz
        UNIQUE (internal_id, quiz_id),

    CONSTRAINT chk_quiz_attempts_submission_state
        CHECK (
            (
                status = 'submitted'
                AND submitted_at IS NOT NULL
                AND score IS NOT NULL
                AND score_percentage IS NOT NULL
            )
            OR
            (
                status <> 'submitted'
                AND submitted_at IS NULL
                AND score IS NULL
                AND score_percentage IS NULL
            )
        )
);
```

**Design note:** The SQL above is a proposed implementation of the schema, not a claim that every column and lifecycle rule has been separately approved. The status values and score fields should be reviewed against the intended attempt lifecycle before the schema is finalized.

## 3. Relationships

### 3.1 Quiz relationship

- Each attempt belongs to exactly one quiz.
- A quiz can have multiple attempts.
- A learner can retry a quiz without overwriting previous attempts.
- Soft-deleting a quiz does not automatically delete its attempts.
- Permanent quiz deletion cascades to dependent attempt records under the proposed foreign-key policy.

### 3.2 User relationship

- Each attempt belongs to exactly one learner.
- A learner can have multiple attempts across different quizzes and multiple attempts at the same quiz.
- The backend derives the learner identity from the authenticated session rather than trusting a client-supplied `user_id`.
- The proposed `ON DELETE RESTRICT` policy prevents deleting a user while attempt history still references that user.

### 3.3 Answer relationship

The `quiz_answers` table stores one row per selected option, rather than storing all answers as JSON inside `quiz_attempts`.

- `quiz_answers.attempt_id` references `quiz_attempts.internal_id` with `ON DELETE CASCADE`.
- Each answer references both `question_id` and `question_option_id`.
- A composite foreign key ensures that the selected option belongs to the referenced question.
- A composite index on `(attempt_id, question_id)` supports attempt review and scoring queries.
- A unique constraint on `(attempt_id, question_option_id)` prevents selecting the same option twice within an attempt.

The attempt's quiz association must also be enforced consistently with the referenced question's quiz. The related composite foreign-key design must be carried through the attempt, question, and answer tables.

## 4. Attempt Lifecycle

### `in_progress`

- The learner is actively taking the quiz.
- Answers may be inserted, updated, or deleted.
- The learner may change selections.
- Final scoring fields remain `NULL`.

### `submitted`

- The learner has submitted the attempt.
- The backend calculates the final score and percentage.
- `submitted_at` records the submission time.
- Answer rows become immutable through backend validation.
- The attempt's final results are retained for review.

### `abandoned`

- The learner has abandoned an attempt without submitting it.
- The attempt remains available as historical state.
- The proposed schema does not assign a final score to an abandoned attempt.

The backend must validate allowed state transitions. A submitted attempt must not return to `in_progress`, and its answers must not be modified.

## 5. Scoring Rules

NoteGenius uses fixed one-point scoring per question.

- `score` represents the number of questions answered correctly.
- `total_questions` represents the number of questions in the attempt.
- `score_percentage` is calculated as:

\[
\text{score percentage}
=
\frac{\text{score}}{\text{total questions}}
\times 100
\]

For multiple-choice questions, a question is correct only when the selected set matches the complete correct-answer set.

The backend derives correctness from `quiz_question_answers` and the learner's current selections in `quiz_answers`. It must not trust correctness values supplied by the client.

Scoring and the transition to `submitted` must execute atomically within a database transaction.

## 6. Indexes and Constraints

### Primary and unique constraints

- `PRIMARY KEY (internal_id)`
- `UNIQUE (public_id)`
- `UNIQUE (internal_id, quiz_id)` to support composite foreign-key relationships.

### Recommended query indexes

```sql
CREATE INDEX idx_quiz_attempts_user_quiz_started
    ON quiz_attempts (user_id, quiz_id, started_at DESC);

CREATE INDEX idx_quiz_attempts_quiz
    ON quiz_attempts (quiz_id);

CREATE INDEX idx_quiz_attempts_user_status
    ON quiz_attempts (user_id, status);
```

These indexes support retrieving a learner's attempts for a quiz, listing quiz attempts, and filtering attempts by status. PostgreSQL automatically creates indexes for primary keys and unique constraints.

### Additional validation

- The backend verifies that the learner is authorized to access the quiz.
- The backend prevents unauthorized users from reading or changing another learner's attempts.
- The backend validates answer selection against the question type and available options.
- The backend enforces immutability for submitted attempts.
- `updated_at` is maintained by the backend on applicable updates.

## 7. Soft Deletion and Historical Data

Quiz soft deletion is represented by `quizzes.deleted_at`, not by an attempt-level deletion flag.

An attempt is not automatically removed when its quiz is soft-deleted. The application should apply the quiz's visibility and access rules when deciding whether a learner can resume or review an attempt.

The proposed schema does not add `deleted_at` to `quiz_attempts`. Permanent deletion and account-deletion retention policies must be applied consistently with the foreign-key relationships and the application's data-retention requirements.

## 8. API and Query Considerations

Attempt operations should use `public_id` for externally exposed resource identifiers and `internal_id` for database joins.

Typical operations include:

- Start a new attempt.
- Retrieve an in-progress attempt.
- Save or change selected answers.
- Submit an attempt and calculate its final score.
- Retrieve a submitted attempt and its answer review.
- List a learner's previous attempts for a quiz.

Every operation must verify ownership and authorization using the authenticated user.

## 9. Implementation Notes

- Use Drizzle ORM for table definitions, migrations, and typed queries.
- Use database transactions for submission and scoring.
- Use backend validation for attempt state transitions and answer immutability.
- Keep reusable quiz content separate from learner-specific attempt data.
- Avoid storing answer selections as JSONB in `quiz_attempts`; retain the normalized `quiz_answers` table.
- Ensure the composite foreign-key design prevents an answer from linking an attempt to a question belonging to a different quiz.

## 10. Status

This document is a **design draft**. The separation between quizzes, attempts, and selected answers is established. The proposed status lifecycle, score-field representation, deletion policies, and final constraints should be reconciled with the previously approved table decisions before marking the document finalized.
