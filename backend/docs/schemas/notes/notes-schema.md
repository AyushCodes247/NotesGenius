# NoteGenius — Notes Database Schema

**Document:** `docs/notes-schema.md`
**Version:** 1.0
**Status:** Draft for Review
**Database:** PostgreSQL
**ORM:** Drizzle ORM

---

## 1. Purpose

The `notes` table stores generated study notes and their associated metadata, ownership, source references, and visibility settings.

Each independently saved generation creates a new note record. Regeneration must not overwrite an existing saved note.

The original input is represented through separate nullable fields, depending on the generation mode. Note sharing is managed through the separate `note_shares` table.

## 2. Design Decisions

| Decision               | Confirmed design                                                           |
| ---------------------- | -------------------------------------------------------------------------- |
| Primary key            | `internal_id BIGSERIAL PRIMARY KEY`                                        |
| Public identifier      | `public_id UUID` with a unique constraint and PostgreSQL-generated default |
| Ownership              | Required `user_id` referencing `users.internal_id`                         |
| User deletion          | `ON DELETE RESTRICT`                                                       |
| Title                  | Required `VARCHAR(255)`                                                    |
| Content                | Required `TEXT`, storing generated Markdown                                |
| Source document        | Nullable FK to `document_meta.internal_id`, using `ON DELETE RESTRICT`     |
| Original pasted text   | Nullable `TEXT`                                                            |
| Topic                  | Nullable `VARCHAR(255)`                                                    |
| Generation mode        | Required `VARCHAR(30)` with a `CHECK` constraint                           |
| Visibility             | Required `VARCHAR(10)` with a `CHECK` constraint                           |
| Creation timestamp     | `created_at TIMESTAMPTZ`                                                   |
| Modification timestamp | `updated_at TIMESTAMPTZ`, maintained by a PostgreSQL trigger               |
| Soft deletion          | Nullable `deleted_at TIMESTAMPTZ`                                          |
| Regeneration           | Create a new note record                                                   |
| Sharing                | Managed separately through `note_shares`                                   |

## 3. Column Definitions

### 3.1 Identifiers and ownership

#### `internal_id`

- Type: `BIGSERIAL`
- Constraint: Primary key
- Purpose: Internal relational identifier used by foreign keys.

#### `public_id`

- Type: `UUID`
- Constraint: `NOT NULL UNIQUE`
- Default: `gen_random_uuid()`
- Purpose: Public identifier used in API requests and external references instead of exposing sequential internal IDs.

#### `user_id`

- Type: `BIGINT`
- Constraint: `NOT NULL`, foreign key to `users(internal_id)`
- Delete behavior: `ON DELETE RESTRICT`
- Purpose: Identifies the owner of the note.

Permanent user deletion must explicitly resolve dependent notes and related records before deleting the user. Soft deletion of a user does not automatically delete their notes.

### 3.2 Note title and content

#### `title`

- Type: `VARCHAR(255)`
- Constraint: `NOT NULL`
- Purpose: Stores the note's title.

The application should generate a suitable default title when the user does not supply one and validate the title before persistence. No database constraint is required for title formatting.

#### `content`

- Type: `TEXT`
- Constraint: `NOT NULL`
- Purpose: Stores the complete generated note as Markdown.

The frontend renders the Markdown, while export functionality converts it into formats such as PDF or images.

**Security requirements:**

- Safely render and sanitize Markdown.
- Prevent unsafe HTML and script injection.
- Do not trust generated or user-provided content as safe HTML.
- Apply appropriate authorization before returning note content.

### 3.3 Source document

#### `source_document_id`

- Type: `BIGINT`
- Constraint: Nullable foreign key to `document_meta(internal_id)`
- Delete behavior: `ON DELETE RESTRICT`
- Purpose: References the uploaded document used to generate the note, when applicable.

A single uploaded document can generate multiple saved notes.

A document cannot be permanently deleted while notes still reference it. The deletion workflow must explicitly resolve those relationships before permanent deletion.

For pasted-text and topic-only generation, this field is `NULL` unless an uploaded document was also used as the source.

### 3.4 Original pasted input

#### `source_text`

- Type: `TEXT`
- Constraint: Nullable
- Purpose: Preserves the original text supplied by the user when generating a note from pasted text.

Expected behavior:

| Generation scenario       | `source_text`                  |
| ------------------------- | ------------------------------ |
| Pasted-text generation    | Store the original pasted text |
| Document-based generation | `NULL`                         |
| Topic-only generation     | `NULL`                         |

The field preserves the original input independently of the generated Markdown in `content`, making it available for reference or future regeneration.

Because this field may contain user-provided material, access must follow the note owner's authorization and data-retention policies.

### 3.5 Topic

#### `topic`

- Type: `VARCHAR(255)`
- Constraint: Nullable
- Purpose: Records the subject or topic associated with generating the note.

For topic-based generation, store the supplied topic. For document-based and pasted-text generation, keep the field `NULL` when no topic is supplied. If the user explicitly supplies an additional topic, it may also be stored.

### 3.6 Generation mode

#### `generation_mode`

- Type: `VARCHAR(30)`
- Constraint: `NOT NULL`
- Allowed values:
  - `document`
  - `pasted_text`
  - `topic`

This field records the primary input mode used to generate the note.

The application must set the value consistently with the source fields and validate the request before inserting the record.

The database constraint validates the allowed mode values. Application-level validation is responsible for enforcing cross-field rules, such as requiring the appropriate source input for the selected mode.

### 3.7 Visibility

#### `visibility`

- Type: `VARCHAR(10)`
- Constraint: `NOT NULL`
- Allowed values:
  - `private`
  - `public`

The field controls the note's intended visibility.

Private notes must be accessible only to the owner and other explicitly authorized users. Public notes may be accessed according to the application's public-note policy.

Changing a note to public must not bypass authentication requirements for modifying it. All update, deletion, and sharing operations must verify ownership or the appropriate permission.

### 3.8 Timestamps and soft deletion

#### `created_at`

- Type: `TIMESTAMPTZ`
- Constraint: `NOT NULL`
- Default: `NOW()`
- Purpose: Records when the note was created.

#### `updated_at`

- Type: `TIMESTAMPTZ`
- Constraint: `NOT NULL`
- Default: `NOW()`
- Purpose: Records the last modification time.

A PostgreSQL `BEFORE UPDATE` trigger using the shared `set_updated_at()` function maintains this field automatically.

#### `deleted_at`

- Type: `TIMESTAMPTZ`
- Constraint: Nullable
- Purpose: Supports soft deletion.

When a note is soft-deleted, set `deleted_at` to the deletion timestamp. A value of `NULL` indicates that the note has not been soft-deleted.

Soft-deleted notes must be excluded from normal retrieval, public access, sharing, and relevant processing workflows. Permanent deletion must explicitly resolve dependent records such as shares, quizzes, and quiz relationships.

Soft deletion does not activate PostgreSQL `ON DELETE` actions.

## 4. SQL DDL

```sql
CREATE TABLE notes (
    internal_id BIGSERIAL PRIMARY KEY,

    public_id UUID NOT NULL UNIQUE
        DEFAULT gen_random_uuid(),

    user_id BIGINT NOT NULL
        REFERENCES users (internal_id)
        ON DELETE RESTRICT,

    title VARCHAR(255) NOT NULL,

    content TEXT NOT NULL,

    source_document_id BIGINT NULL
        REFERENCES document_meta (internal_id)
        ON DELETE RESTRICT,

    source_text TEXT NULL,

    topic VARCHAR(255) NULL,

    generation_mode VARCHAR(30) NOT NULL
        CHECK (
            generation_mode IN (
                'document',
                'pasted_text',
                'topic'
            )
        ),

    visibility VARCHAR(10) NOT NULL
        DEFAULT 'private'
        CHECK (
            visibility IN ('private', 'public')
        ),

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    deleted_at TIMESTAMPTZ NULL
);
```

The DDL uses `gen_random_uuid()` for public identifiers. Ensure the PostgreSQL deployment supports this function.

## 5. Indexing Strategy

The primary key and unique constraint on `public_id` provide indexes automatically.

The following additional indexes are recommended for common access patterns:

```sql
-- Retrieve a user's notes, newest first.
CREATE INDEX notes_user_created_at_idx
ON notes (user_id, created_at DESC);

-- Find notes referencing an uploaded document.
CREATE INDEX notes_source_document_id_idx
ON notes (source_document_id)
WHERE source_document_id IS NOT NULL;

-- Retrieve public, non-deleted notes in chronological order.
CREATE INDEX notes_public_created_at_idx
ON notes (created_at DESC)
WHERE visibility = 'public'
  AND deleted_at IS NULL;
```

The application should normally filter out soft-deleted notes. The public-note index is partial because it only covers public notes that have not been soft-deleted.

Index effectiveness should be validated using representative queries and `EXPLAIN ANALYZE`. Additional indexes should be introduced only when query patterns and measurements justify them.

## 6. Updated Timestamp Trigger

The `set_updated_at()` trigger function is shared across tables that maintain an `updated_at` field. Create the function only once if it already exists in the database.

```sql
CREATE TRIGGER notes_set_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
```

The function implementation:

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 7. Data Integrity and Application Rules

1. **New record on regeneration:** Every independently saved generation creates a new row. Existing notes are not overwritten by regeneration.
2. **Ownership enforcement:** Only the owner or an appropriately authorized actor may modify or delete a note.
3. **Source consistency:** The backend validates that the chosen generation mode matches the provided source input.
4. **Markdown safety:** Markdown rendering and exports must not execute untrusted HTML or scripts.
5. **Visibility enforcement:** Private notes must never be exposed through public endpoints or unauthorized share access.
6. **Soft-delete filtering:** Normal retrieval and public access exclude soft-deleted notes.
7. **Permanent deletion:** Dependent shares, quizzes, and other relationships must be explicitly resolved before permanent deletion.
8. **Document lifecycle:** Permanent document deletion is restricted while a note references that document.
9. **Sensitive input retention:** Original pasted text must follow the same access-control and retention protections as the associated note.
10. **Identifier exposure:** Public APIs use `public_id`, not `internal_id`, for external note identification.

## 8. Relationships

| Related table   | Relationship                                    | Delete behavior               |
| --------------- | ----------------------------------------------- | ----------------------------- |
| `users`         | One user owns many notes                        | `RESTRICT`                    |
| `document_meta` | One document may generate many notes            | `RESTRICT`                    |
| `note_shares`   | A note may have multiple share records          | Managed by the sharing schema |
| `quiz`          | A note may be associated with generated quizzes | Managed by the quiz schema    |

The `notes` table stores note content and core metadata. Sharing, quiz questions, quiz options, attempts, and answers remain in their respective tables.

## 9. Scope Boundaries

The following are intentionally outside this table:

- PDF and image export files and their storage metadata.
- Document chunking and embeddings, stored in `document_vector`.
- Share recipients and sharing permissions, stored in `note_shares`.
- Quiz content and attempts, stored in the quiz-related tables.
- AI processing job history and retry tracking.
- Topic-chat message history.

These responsibilities should remain in their appropriate modules and schemas.

---

**Document status:** Draft for Review
**Version:** 1.0
**Next step:** Review this schema before moving to the next table.
