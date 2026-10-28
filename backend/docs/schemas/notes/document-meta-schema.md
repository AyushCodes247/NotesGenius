# NoteGenius — Document Metadata Database Schema

**File:** `docs/document-meta-schema.md`  
**Version:** 1.0  
**Status:** Confirmed  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM

---

## 1. Purpose

The `document_meta` table stores metadata for documents uploaded by NoteGenius users. The original file bytes are stored in S3-compatible object storage; PostgreSQL stores the metadata and the opaque storage key used to locate the file.

A single uploaded document can be used to generate multiple notes.

## 2. Design decisions

| Decision                       | Confirmed design                                   |
| ------------------------------ | -------------------------------------------------- |
| Internal primary key           | `BIGSERIAL PRIMARY KEY`                            |
| Public identifier              | PostgreSQL-generated UUID v4                       |
| Document owner                 | Required `user_id` referencing `users.internal_id` |
| Original filename              | `VARCHAR(255) NOT NULL`                            |
| MIME type                      | `VARCHAR(100) NOT NULL`, validated by the backend  |
| File size                      | `BIGINT NOT NULL`, measured in bytes               |
| Object storage reference       | Opaque, unique `storage_key`                       |
| Integrity verification         | SHA-256 checksum in hexadecimal                    |
| Processing lifecycle           | `pending`, `processing`, `completed`, `failed`     |
| Processing completion          | Nullable `processed_at`                            |
| Soft deletion                  | Nullable `deleted_at`                              |
| Creation timestamp             | `created_at` with a database default               |
| Update timestamp               | Not included                                       |
| Standalone creation-time index | Not included                                       |
| User deletion behavior         | Restrictive foreign-key behavior                   |

## 3. Column definitions

| Column              | PostgreSQL type | Constraints and purpose                                           |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| `internal_id`       | `BIGSERIAL`     | Primary key; internal database identifier                         |
| `public_id`         | `UUID`          | Required, unique, generated using `gen_random_uuid()`             |
| `user_id`           | `BIGINT`        | Required foreign key to `users.internal_id`                       |
| `original_filename` | `VARCHAR(255)`  | Required original filename for display                            |
| `mime_type`         | `VARCHAR(100)`  | Required server-validated media type                              |
| `file_size_bytes`   | `BIGINT`        | Required exact file size in bytes                                 |
| `storage_key`       | `TEXT`          | Required, unique opaque object-storage key                        |
| `checksum_sha256`   | `CHAR(64)`      | Required SHA-256 hexadecimal digest                               |
| `processing_status` | `VARCHAR(20)`   | Required status, default `pending`, constrained to allowed values |
| `processed_at`      | `TIMESTAMPTZ`   | Nullable timestamp of the latest successful processing            |
| `created_at`        | `TIMESTAMPTZ`   | Required, defaults to `NOW()`                                     |
| `deleted_at`        | `TIMESTAMPTZ`   | Nullable soft-deletion timestamp                                  |

## 4. PostgreSQL DDL

```sql
CREATE TABLE document_meta (
    internal_id BIGSERIAL PRIMARY KEY,

    public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    user_id BIGINT NOT NULL
        REFERENCES users (internal_id),

    original_filename VARCHAR(255) NOT NULL,

    mime_type VARCHAR(100) NOT NULL,

    file_size_bytes BIGINT NOT NULL,

    storage_key TEXT NOT NULL UNIQUE,

    checksum_sha256 CHAR(64) NOT NULL,

    processing_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            processing_status IN (
                'pending',
                'processing',
                'completed',
                'failed'
            )
        ),

    processed_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ NULL
);
```

**Implementation note:** The foreign key intentionally omits `ON DELETE CASCADE`. PostgreSQL's default `NO ACTION` behavior prevents deleting a referenced user while dependent document records remain. The permanent-deletion workflow must explicitly resolve dependent records first.

The `UNIQUE` constraints on `public_id` and `storage_key` create their corresponding unique indexes. No additional `created_at` index is defined.

## 5. Processing lifecycle

| Status       | Meaning                                  |
| ------------ | ---------------------------------------- |
| `pending`    | Document is awaiting processing          |
| `processing` | Processing is underway                   |
| `completed`  | Required document processing succeeded   |
| `failed`     | Processing failed; retry may be possible |

The status represents the document's overall processing state, not individual job history.

### `processed_at` rules

- Initially `NULL`.
- Set when processing succeeds.
- On reprocessing, updated to the latest successful completion time.
- A failed retry must not overwrite a previously recorded successful completion time.

Retry counts, error details, and job history can be handled by a separate processing-job design if required.

## 6. Ownership and deletion rules

### Ownership

- Every document must belong to one user.
- `user_id` references the user's internal database ID, not their public UUID.
- The backend must authorize each document operation against the authenticated user.
- The foreign key provides referential integrity but does not replace authorization checks.

### Soft deletion

When a document is soft-deleted:

1. Set `deleted_at` to the deletion timestamp.
2. Exclude the document from normal listing and retrieval operations.
3. Prevent new processing or other operations that should not be allowed on deleted documents.
4. Schedule controlled cleanup of the associated object-storage file.
5. Handle dependent notes and document vectors according to their own schema and lifecycle rules.

Soft deletion does not immediately remove the database row or object-storage file.

### Permanent user deletion

Permanent user deletion must follow an explicit cleanup workflow that resolves dependent records before deleting the user. Object storage and other external resources must also be considered because database foreign keys cannot clean them up automatically.

## 7. Upload validation and storage security

- Enforce the maximum upload size of **4 MiB (4,194,304 bytes)** before document processing.
- Accept only the configured file types: PDF, DOCX, TXT, MD, and PNG.
- Do not trust the client's filename, extension, or supplied MIME type.
- Validate the file content using appropriate server-side detection and format-specific checks.
- Generate `storage_key` on the backend; never derive it from `original_filename`.
- Compute `checksum_sha256` from the uploaded bytes on the backend.
- Keep the object-storage bucket private and authorize downloads through the backend or controlled, short-lived signed URLs.
- Do not expose internal storage keys unnecessarily in public API responses.

## 8. Indexing strategy

The confirmed design includes:

- The primary-key index on `internal_id`.
- The unique index on `public_id`.
- The unique index on `storage_key`.

No standalone index is added to `created_at`.

Additional indexes, including a composite index for listing a user's documents by creation time, should be introduced only after the main query patterns and expected query plans have been reviewed.

## 9. Relationship with other tables

- **`users`** — establishes ownership through `user_id`.
- **`document_vector`** — stores ordered chunks and embeddings for uploaded documents.
- **`notes`** — may reference a source document; one document can generate multiple notes.

The foreign-key and deletion behavior of dependent tables must be designed consistently with the confirmed restrictive deletion policy.

## 10. Out of scope

This table does not store:

- The uploaded file's binary content.
- Extracted document text or embedding vectors.
- Generated note content.
- Per-job retry history and detailed processing errors.
- Exported PDF or image files for generated notes.

These concerns belong to object storage or their respective database tables and services.

---

**Schema review outcome:** The `document_meta` design is confirmed at version 1.0. Implementation and migration testing remain separate engineering steps.
