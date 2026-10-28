# Quiz Answers Schema

**Project:** NoteGenius  
**Document:** `quiz-answers-schema.md`  
**Version:** 1.0  
**Status:** Confirmed design draft  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM

---

## 1. Purpose

The `quiz_answers` table stores the options selected by a learner during a quiz attempt.

Each selected option is represented by one row. A single-choice question can have at most one selected option per attempt, while a multiple-choice question can have multiple selected options.

The table supports:

- Saving and updating current selections.
- Removing deselected options during an in-progress attempt.
- Tracking correctness for selected options.
- Reviewing submitted answers and calculating scores.
- Preventing duplicate option selections.
- Enforcing question-option and attempt-quiz relationships.
- Preserving submitted answers through backend-enforced immutability.

## 2. Table Definition

### `quiz_answers`

| Column               | PostgreSQL type | Constraints                                       | Purpose                                                                               |
| -------------------- | --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `internal_id`        | `BIGSERIAL`     | Primary key                                       | Internal identifier for joins.                                                        |
| `public_id`          | `UUID`          | `NOT NULL`, `UNIQUE`, default `gen_random_uuid()` | Public identifier for an answer row.                                                  |
| `attempt_id`         | `BIGINT`        | `NOT NULL`, FK to `quiz_attempts.internal_id`     | Identifies the learner's quiz attempt.                                                |
| `question_id`        | `BIGINT`        | `NOT NULL`                                        | Identifies the question being answered.                                               |
| `question_option_id` | `BIGINT`        | `NOT NULL`                                        | Identifies the selected option.                                                       |
| `is_correct`         | `BOOLEAN`       | `NOT NULL`                                        | Records whether this selected option is a correct option according to the answer key. |
| `created_at`         | `TIMESTAMPTZ`   | `NOT NULL`, default `NOW()`                       | Records when the current selection row was created.                                   |
| `updated_at`         | `TIMESTAMPTZ`   | `NOT NULL`, default `NOW()`                       | Records when the selection row or its stored correctness was last changed.            |

## 3. SQL Definition

The following definition establishes the confirmed column structure and answer-level constraints. Composite foreign keys that enforce consistency across the attempt's quiz and the question's quiz must be added alongside the corresponding constraints on the parent tables.

```sql
CREATE TABLE quiz_answers (
    internal_id BIGSERIAL PRIMARY KEY,

    public_id UUID NOT NULL UNIQUE
        DEFAULT gen_random_uuid(),

    attempt_id BIGINT NOT NULL
        REFERENCES quiz_attempts(internal_id)
        ON DELETE CASCADE,

    question_id BIGINT NOT NULL,

    question_option_id BIGINT NOT NULL,

    is_correct BOOLEAN NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_quiz_answers_attempt_option
        UNIQUE (attempt_id, question_option_id),

    CONSTRAINT fk_quiz_answers_question_option
        FOREIGN KEY (question_id, question_option_id)
        REFERENCES quiz_question_options(question_id, internal_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_quiz_answers_attempt_question
    ON quiz_answers (attempt_id, question_id);
```

**Migration requirement:** The composite foreign key for `(question_id, question_option_id)` requires a matching unique constraint on `quiz_question_options(question_id, internal_id)`. That constraint is part of the previously confirmed options schema.

## 4. Relationships

### 4.1 Quiz attempt

- Each answer row belongs to one attempt through `attempt_id`.
- An attempt can contain multiple answer rows.
- Deleting an attempt permanently cascades to its associated answer rows.
- An answer can be inserted, updated, or deleted only while its attempt is `in_progress`.

### 4.2 Question and selected option

- Each answer references one question and one selected option.
- The composite foreign key ensures the selected option belongs to the referenced question.
- `ON DELETE CASCADE` prevents answer rows from remaining when their referenced question-option relationship is permanently deleted.
- Soft deletion of a quiz does not automatically trigger these cascades.

### 4.3 Cross-quiz consistency

The database must prevent an answer from referencing a question outside the quiz associated with its attempt.

Enforce this through composite foreign keys and matching unique constraints across the parent tables. The implementation must ensure that:

1. The attempt's quiz is identified consistently.
2. The question belongs to that quiz.
3. The selected option belongs to that question.

The ordinary foreign key on `attempt_id` and the question-option composite foreign key alone do not enforce the relationship between the attempt's quiz and the question's quiz. The additional composite constraints are therefore required.

## 5. Selection Rules

### Single-choice questions

The backend permits at most one selected option for a given attempt and question.

### Multiple-choice questions

The backend permits multiple selected options, provided each belongs to the question.

### Duplicate selections

The unique constraint:

```sql
UNIQUE (attempt_id, question_option_id)
```

prevents the same option from being selected more than once in one attempt.

### Option cardinality

The backend validates selection cardinality according to the question type. The database schema does not attempt to enforce this through a simple `CHECK` constraint because the rule depends on related rows and the question type.

## 6. Correctness and Scoring

`is_correct` is computed and validated by the backend against `quiz_question_answers`.

- Correctness is recalculated when a learner changes their selections during an in-progress attempt.
- When a selected option is deselected, its answer row is deleted.
- Remaining selections are re-evaluated as needed.
- At submission, the backend calculates the final result for each question and the overall score.
- The client must never supply a trusted `is_correct` value.

For multiple-choice questions, a question is correct only if the learner's complete selected-option set matches the correct-answer set. An individual selected option being correct does not, by itself, make the entire question correct.

The `is_correct` column records option-level correctness; the backend must separately evaluate complete-set correctness for scoring.

## 7. Timestamps

- `created_at` is set when the current selection row is inserted.
- `updated_at` is updated when the row's stored correctness or other permitted row data changes.
- No `selected_at` column is required.
- No `deleted_at` column is required.
- Deselected options are hard-deleted rather than retained as historical selection records.

## 8. Immutability After Submission

Submitted attempts and their answer rows are immutable.

The backend must reject answer inserts, updates, and deletes when the associated attempt is no longer `in_progress`.

Submission and final scoring must be performed within a database transaction so the attempt's submitted state and final results cannot be partially persisted.

The database-level composite foreign keys enforce relationship integrity; submitted-answer immutability is enforced through centralized backend validation, as confirmed in the design decisions.

## 9. Indexes and Constraints

| Constraint or index                              | Purpose                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Primary key on `internal_id`                     | Identifies each row internally.                                         |
| Unique constraint on `public_id`                 | Provides a unique public identifier.                                    |
| Unique `(attempt_id, question_option_id)`        | Prevents duplicate selections within an attempt.                        |
| Index `(attempt_id, question_id)`                | Supports question-level retrieval, attempt review, and scoring queries. |
| Composite FK `(question_id, question_option_id)` | Ensures the selected option belongs to the referenced question.         |
| Composite attempt-question-to-quiz constraints   | Enforce cross-quiz consistency across parent and child tables.          |
| FK on `attempt_id` with `ON DELETE CASCADE`      | Removes dependent answers when an attempt is permanently deleted.       |

No standalone `question_id` index is added because the confirmed access patterns are covered by the composite index.

## 10. Security and Validation

The backend must:

- Derive the learner identity from the authenticated session.
- Verify attempt ownership before reading or modifying answers.
- Confirm the attempt is in progress before any selection change.
- Validate question type and selection cardinality.
- Verify selected options belong to the specified question.
- Compute correctness from the authoritative answer key.
- Reject changes to submitted attempts.
- Use transactions for answer updates and submission.
- Avoid exposing correct answers to unauthorized learners before submission.

## 11. Design Decisions Summary

| Decision                         | Confirmed choice                              |
| -------------------------------- | --------------------------------------------- |
| Answer representation            | One row per selected option                   |
| Attempt relationship             | Required `attempt_id` with cascading deletion |
| Question and option relationship | Required composite foreign key                |
| Row identifiers                  | `internal_id` plus unique `public_id`         |
| Duplicate prevention             | Unique `(attempt_id, question_option_id)`     |
| Correctness                      | Stored in `is_correct`, computed by backend   |
| Evaluation timing                | On selection changes and final submission     |
| Selection cardinality            | Backend validation                            |
| Timestamps                       | `created_at` and `updated_at`                 |
| Deselection                      | Hard-delete the selection row                 |
| Selection timestamp              | No separate `selected_at`                     |
| Retrieval index                  | Composite `(attempt_id, question_id)`         |
| Cross-quiz integrity             | Composite foreign keys                        |
| Submitted-answer immutability    | Backend validation                            |
| Selection history                | Store only current selections                 |

## 12. Status

**Status: Confirmed design draft.**

All 15 `quiz_answers` design decisions have been incorporated. Before implementation, verify the complete composite foreign-key migration across `quiz_attempts`, `quiz_questions`, `quiz_question_options`, and `quiz_answers`, and ensure submission transactions preserve the final scoring and immutability rules.
