# Quiz Questions Database Schema

**Project:** NoteGenius  
**Document:** `quiz-questions-schema.md`  
**Version:** 1.0  
**Status:** Confirmed design draft  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM

---

## 1. Overview

This document defines the relational database schema for quiz questions, their answer options, and the records identifying correct answers.

The schema uses three tables:

- `quiz_questions` — stores questions belonging to a quiz.
- `quiz_question_options` — stores the ordered answer options for each question.
- `quiz_question_answers` — identifies which option or options are correct.

The design keeps options and correct answers in separate relational tables rather than storing them as JSON.

## 2. Design Decisions

| Area                   | Decision                                                                        |
| ---------------------- | ------------------------------------------------------------------------------- |
| Primary keys           | `BIGSERIAL` internal identifiers                                                |
| Public identifiers     | UUIDs for questions and options                                                 |
| Question types         | `single_choice`, `multiple_choice`                                              |
| Question numbering     | One-based, unique within each quiz                                              |
| Option numbering       | One-based, unique within each question                                          |
| Options per question   | Minimum 2, maximum 4                                                            |
| Duplicate option text  | Rejected by backend validation using normalized text                            |
| Scoring                | Fixed at one point per question                                                 |
| Correct-answer storage | Separate relational table                                                       |
| Question deletion      | Cascade when its parent quiz is permanently deleted                             |
| Option deletion        | Cascade associated correct-answer records                                       |
| Soft deletion          | Questions follow the parent quiz lifecycle; no option-level `deleted_at` column |
| Timestamps             | `created_at` on questions and options; no `updated_at` on options               |
| Validation             | Backend validation, including before quiz completion                            |
| Database triggers      | No trigger-based option-count or answer-count validation                        |

## 3. Table: `quiz_questions`

Stores each generated question and its relationship to the parent quiz.

### 3.1 Column definitions

| Column            | Type          | Constraints                                                | Description                                |
| ----------------- | ------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `internal_id`     | `BIGSERIAL`   | Primary key                                                | Internal question identifier               |
| `public_id`       | `UUID`        | Not null, unique, default `gen_random_uuid()`              | Public-facing question identifier          |
| `quiz_id`         | `BIGINT`      | Not null, FK to `quizzes.internal_id`, `ON DELETE CASCADE` | Parent quiz                                |
| `question_number` | `INTEGER`     | Not null, `CHECK (question_number >= 1)`                   | One-based question order                   |
| `question_type`   | `VARCHAR(30)` | Not null, restricted to supported values                   | Question response type                     |
| `question_text`   | `TEXT`        | Not null                                                   | Question prompt                            |
| `explanation`     | `TEXT`        | Nullable                                                   | Optional explanation of the correct answer |
| `hint`            | `TEXT`        | Nullable                                                   | Optional learner-facing hint               |
| `created_at`      | `TIMESTAMPTZ` | Not null, default `NOW()`                                  | Record creation timestamp                  |

### 3.2 Question type constraint

Supported values:

- `single_choice` — exactly one correct option.
- `multiple_choice` — at least two correct options.

True/false questions are excluded from the initial version.

```sql
CHECK (
    question_type IN ('single_choice', 'multiple_choice')
)
```

### 3.3 Question numbering constraint

Question numbers must be positive and unique within a quiz.

```sql
CHECK (question_number >= 1);

UNIQUE (quiz_id, question_number);
```

The application assigns consecutive one-based numbers when creating or reordering questions.

### 3.4 Question deletion behavior

The foreign key to `quizzes.internal_id` uses `ON DELETE CASCADE`.

- Permanently deleting a quiz deletes its associated questions.
- Soft-deleting a quiz does not trigger the foreign-key cascade.
- The application's quiz lifecycle and access-control rules determine whether soft-deleted quiz content can be accessed.

### 3.5 Question scoring

Every question is worth one point. No `points` column is required.

For a completed attempt, the maximum score is the number of questions included in that attempt.

---

## 4. Table: `quiz_question_options`

Stores the answer choices belonging to each question.

### 4.1 Column definitions

| Column          | Type          | Constraints                                                       | Description                     |
| --------------- | ------------- | ----------------------------------------------------------------- | ------------------------------- |
| `internal_id`   | `BIGSERIAL`   | Primary key                                                       | Internal option identifier      |
| `public_id`     | `UUID`        | Not null, unique, default `gen_random_uuid()`                     | Public-facing option identifier |
| `question_id`   | `BIGINT`      | Not null, FK to `quiz_questions.internal_id`, `ON DELETE CASCADE` | Parent question                 |
| `option_number` | `INTEGER`     | Not null, positive                                                | One-based option order          |
| `option_text`   | `TEXT`        | Not null                                                          | Displayed option text           |
| `created_at`    | `TIMESTAMPTZ` | Not null, default `NOW()`                                         | Record creation timestamp       |

### 4.2 Option ordering

Each question must have unique, positive option numbers.

```sql
CHECK (option_number >= 1);

UNIQUE (question_id, option_number);
```

The application manages ordering and renumbering when options change.

### 4.3 Option count validation

Backend validation enforces the following rules:

- Minimum: 2 options per question.
- Maximum: 4 options per question.

These checks run during question generation and again before the quiz is marked `completed`. The database does not use a trigger to enforce the count.

### 4.4 Duplicate option text

The backend rejects duplicate options using normalized text comparison. No database uniqueness constraint is imposed on `option_text`.

The normalization procedure must be consistently implemented across generation and validation paths.

### 4.5 Option deletion behavior

Deleting an option cascades to its associated `quiz_question_answers` records.

The application must revalidate the affected question and its correct-answer cardinality before allowing the quiz to transition to `completed`.

Options do not have a `deleted_at` column. Option removal is handled through controlled application logic.

---

## 5. Table: `quiz_question_answers`

Stores the correct option or options for each question. Each row represents one correct option.

### 5.1 Column definitions

| Column               | Type        | Constraints                                                       | Description                             |
| -------------------- | ----------- | ----------------------------------------------------------------- | --------------------------------------- |
| `internal_id`        | `BIGSERIAL` | Primary key                                                       | Internal answer-record identifier       |
| `question_id`        | `BIGINT`    | Not null, FK to `quiz_questions.internal_id`, `ON DELETE CASCADE` | Question whose answer is being recorded |
| `question_option_id` | `BIGINT`    | Not null, references the associated option                        | Correct option identifier               |

The `question_id` and `question_option_id` combination ensures that the selected correct option belongs to the same question.

### 5.2 Referential integrity

Use a composite foreign key so an answer cannot reference an option belonging to a different question.

The options table must expose a unique key on `(question_id, internal_id)` for the composite reference.

```sql
-- Supporting unique key on quiz_question_options
UNIQUE (question_id, internal_id);

-- Composite foreign key on quiz_question_answers
FOREIGN KEY (question_id, question_option_id)
    REFERENCES quiz_question_options (question_id, internal_id)
    ON DELETE CASCADE;
```

The table also has a direct foreign key from `question_id` to `quiz_questions.internal_id` with `ON DELETE CASCADE`.

### 5.3 Duplicate correct-answer prevention

An option must not appear more than once as a correct answer.

```sql
UNIQUE (question_option_id);
```

This is in addition to the composite foreign key. Together, these constraints preserve question-option ownership and prevent duplicate answer records.

### 5.4 Correct-answer cardinality

The backend validates answer cardinality according to the question type:

| Question type     | Required correct options |
| ----------------- | ------------------------ |
| `single_choice`   | Exactly 1                |
| `multiple_choice` | At least 2               |

Validation must occur during generation and before the quiz can be marked `completed`. A quiz must not become completed if any question has an invalid option count or correct-answer count.

These cross-row validation rules are enforced by the application rather than database triggers.

---

## 6. PostgreSQL DDL

The following DDL consolidates the confirmed structural decisions. Apply it after the parent `quizzes` table exists.

```sql
CREATE TABLE quiz_questions (
    internal_id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    quiz_id BIGINT NOT NULL
        REFERENCES quizzes(internal_id)
        ON DELETE CASCADE,

    question_number INTEGER NOT NULL
        CHECK (question_number >= 1),

    question_type VARCHAR(30) NOT NULL
        CHECK (question_type IN ('single_choice', 'multiple_choice')),

    question_text TEXT NOT NULL,
    explanation TEXT NULL,
    hint TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_quiz_questions_number
        UNIQUE (quiz_id, question_number)
);

CREATE TABLE quiz_question_options (
    internal_id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    question_id BIGINT NOT NULL
        REFERENCES quiz_questions(internal_id)
        ON DELETE CASCADE,

    option_number INTEGER NOT NULL
        CHECK (option_number >= 1),

    option_text TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_question_options_number
        UNIQUE (question_id, option_number),

    -- Supporting key for the composite answer foreign key.
    CONSTRAINT uq_question_options_question_internal
        UNIQUE (question_id, internal_id)
);

CREATE TABLE quiz_question_answers (
    internal_id BIGSERIAL PRIMARY KEY,

    question_id BIGINT NOT NULL
        REFERENCES quiz_questions(internal_id)
        ON DELETE CASCADE,

    question_option_id BIGINT NOT NULL,

    CONSTRAINT uq_quiz_question_answers_option
        UNIQUE (question_option_id),

    CONSTRAINT fk_quiz_question_answers_question_option
        FOREIGN KEY (question_id, question_option_id)
        REFERENCES quiz_question_options (question_id, internal_id)
        ON DELETE CASCADE
);
```

**Implementation note:** The supporting composite unique constraint is logically redundant because `internal_id` is already a primary key, but PostgreSQL requires a matching unique key for the composite foreign-key target.

The SQL deliberately does not attempt to enforce minimum or maximum option counts, correct-answer cardinality, or normalized option-text uniqueness. Those remain backend responsibilities.

---

## 7. Application Validation Requirements

Before a quiz is transitioned to `completed`, the backend must validate every question and its related records.

1. Every question has a supported `question_type` and non-empty `question_text`.
2. Each question has between 2 and 4 options.
3. Option numbers are positive and unique within the question.
4. No two options have equivalent normalized text.
5. Each question has the correct number of correct-answer records for its type.
6. Every correct-answer record references an option belonging to its question.
7. Deleting an option causes its associated answer record to be deleted, after which the question is revalidated.
8. Invalid questions prevent the quiz from being marked `completed`.

Where validation and status updates occur in the same database workflow, use an appropriate transaction and concurrency strategy to prevent option changes from racing with completion validation.

---

## 8. Indexing Considerations

The following indexes are already created implicitly by primary-key and unique constraints:

- `quiz_questions.internal_id`
- `quiz_questions.public_id`
- `quiz_questions (quiz_id, question_number)`
- `quiz_question_options.internal_id`
- `quiz_question_options.public_id`
- `quiz_question_options (question_id, option_number)`
- `quiz_question_options (question_id, internal_id)`
- `quiz_question_answers.question_option_id`

Consider an additional index on `quiz_question_answers.question_id` for question-level answer lookups and efficient child-row access during deletion. PostgreSQL does not automatically index referencing foreign-key columns.

```sql
CREATE INDEX idx_quiz_question_answers_question_id
    ON quiz_question_answers (question_id);
```

Review query plans and actual access patterns before adding further indexes.

---

## 9. Dependencies and Scope

This schema depends on the parent `quizzes` table and is used by quiz generation, quiz retrieval, and practice-mode workflows.

The following concerns remain outside these three tables:

- Quiz attempts and learner responses.
- Per-attempt score and progress history.
- Quiz sharing and access control.
- AI generation retries and quiz-level failure metadata.
- Quiz visibility and lifecycle state.

These are handled by the parent quiz schema and the corresponding dedicated tables.

## 10. Version History

| Version | Status                 | Description                                                                     |
| ------- | ---------------------- | ------------------------------------------------------------------------------- |
| 1.0     | Confirmed design draft | Consolidates the approved question, option, and correct-answer schema decisions |
