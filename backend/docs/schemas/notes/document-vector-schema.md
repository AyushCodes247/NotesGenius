# NoteGenius — Document Vector Database Schema

**File:** `docs/document-vector-schema.md`  
**Version:** 1.0  
**Status:** Confirmed  
**Database:** PostgreSQL with `pgvector`  
**ORM:** Drizzle ORM  
**Domain:** Notes / Document Processing

---

## 1. Purpose

The `document_vector` table stores text chunks extracted from uploaded documents and their corresponding vector embeddings.

These embeddings enable semantic retrieval for:

- Retrieval-augmented generation (RAG) for document-grounded AI responses.
- Generating notes from uploaded documents.
- Generating quizzes based on uploaded documents.
- Retrieving relevant document sections without loading an entire document into the AI context.

The original uploaded document and its metadata are managed by `document_meta`. The `document_vector` table stores extracted chunks and their embeddings, not the original uploaded file.

## 2. Scope and Design Principles

- One uploaded document can produce multiple chunks.
- Each chunk belongs to exactly one document.
- Chunk positions are zero-based and ordered within each document.
- Each chunk has a fixed-dimension embedding.
- Embeddings use Google's `gemini-embedding-001` model with 3,072 dimensions.
- Cosine distance is the selected vector similarity metric.
- An HNSW index accelerates approximate nearest-neighbor retrieval.
- Permanently deleting a document automatically deletes its associated chunks and embeddings.
- Soft deletion does not automatically trigger foreign-key cascades.
- The application is responsible for document extraction, chunking, embedding generation, and access control.

Pasted text and topic-only generation do not require entries in `document_vector`; their input handling belongs to the `notes` and AI-processing workflows.

## 3. Table Definition

### 3.1 `document_vector`

| Column        | PostgreSQL type | Constraints           | Purpose                                              |
| ------------- | --------------- | --------------------- | ---------------------------------------------------- |
| `internal_id` | `BIGSERIAL`     | Primary key           | Unique internal identifier for a chunk record        |
| `document_id` | `BIGINT`        | Not null, foreign key | References `document_meta.internal_id`               |
| `chunk_index` | `INTEGER`       | Not null, nonnegative | Zero-based position of the chunk within its document |
| `chunk_text`  | `TEXT`          | Not null              | Extracted text content of the chunk                  |
| `embedding`   | `VECTOR(3072)`  | Not null              | 3,072-dimensional semantic embedding                 |

### 3.2 Column design

**`internal_id`**

Uses a surrogate primary key, independently identifying each chunk record.

**`document_id`**

References the internal identifier of the uploaded document in `document_meta`.

**`chunk_index`**

Stores each chunk's zero-based position. Negative values are rejected by the database.

**`chunk_text`**

Stores the text associated with the embedding. The application is responsible for text extraction, normalization, and chunk boundaries.

**`embedding`**

Stores the embedding generated using `gemini-embedding-001`. The configured model and output dimension must remain consistent for vectors compared within the same embedding space.

## 4. Primary Key and Uniqueness

### 4.1 Surrogate primary key

```sql
internal_id BIGSERIAL PRIMARY KEY
```

This provides a stable, unique identifier for every chunk record.

### 4.2 Unique chunk position

The combination of `document_id` and `chunk_index` must be unique.

```sql
CONSTRAINT document_vector_document_chunk_unique
    UNIQUE (document_id, chunk_index)
```

This prevents duplicate chunk positions within a document while allowing different documents to use the same indexes.

### 4.3 Zero-based indexing

Chunk numbering starts at zero:

```text
Document A: 0, 1, 2, 3, ...
Document B: 0, 1, 2, ...
```

The unique constraint ensures that a document cannot contain two records with the same chunk index.

## 5. Relationship and Deletion Policy

### 5.1 Relationship to `document_meta`

`document_vector.document_id` references `document_meta.internal_id`.

The confirmed foreign-key policy is `ON DELETE CASCADE`.

```sql
document_id BIGINT NOT NULL
    REFERENCES document_meta (internal_id)
    ON DELETE CASCADE
```

**Permanent deletion:** PostgreSQL automatically deletes associated chunk records and embeddings when the referenced `document_meta` row is permanently deleted.

**Soft deletion:** Setting `document_meta.deleted_at` does not trigger this cascade. The application must prevent retrieval of vectors belonging to soft-deleted documents and coordinate any necessary cleanup.

The restrictive relationship between `document_meta` and `users` remains unchanged. This cascade does not bypass the explicit user-deletion workflow.

## 6. Embedding Model and Storage

### 6.1 Selected embedding model

| Setting             | Value                  |
| ------------------- | ---------------------- |
| Provider            | Google                 |
| Model               | `gemini-embedding-001` |
| Embedding dimension | 3,072                  |
| PostgreSQL type     | `VECTOR(3072)`         |
| Similarity metric   | Cosine distance        |

This selection follows the user's prior experience with the model in SIA.

### 6.2 Fixed-dimension storage

```sql
embedding VECTOR(3072) NOT NULL
```

The fixed dimension ensures that each stored vector has the expected number of dimensions.

The application must ensure that the model's output dimension matches the database schema before inserting embeddings.

If the embedding model or its configuration changes in a way that affects vector compatibility, a deliberate migration and re-embedding strategy will be required.

### 6.3 Cosine distance

Cosine distance is the confirmed similarity metric. In pgvector, the `<=>` operator computes cosine distance; smaller values indicate greater similarity.

Example query:

```sql
SELECT
    internal_id,
    document_id,
    chunk_index,
    chunk_text,
    embedding <=> $1 AS cosine_distance
FROM document_vector
WHERE document_id = $2
ORDER BY embedding <=> $1
LIMIT 10;
```

Here:

- `$1` is the query embedding with 3,072 dimensions.
- `$2` is the target document's internal identifier.
- The query retrieves the ten nearest chunks within that document.

This is an illustrative retrieval query. Production queries must also enforce ownership, authorization, visibility, and document lifecycle rules.

## 7. Vector Indexing

### 7.1 HNSW index

The confirmed indexing strategy is an HNSW index using cosine distance.

```sql
CREATE INDEX document_vector_embedding_hnsw_idx
ON document_vector
USING hnsw (embedding vector_cosine_ops);
```

The index accelerates approximate nearest-neighbor searches and provides a practical balance between retrieval performance and recall.

### 7.2 Index trade-offs

HNSW introduces additional index storage, memory requirements, and index-build overhead. Its performance must be evaluated against representative data and queries.

The index does not enforce access control and does not replace application-level document filters.

### 7.3 Document-filtered retrieval

Queries may filter by `document_id` in addition to vector similarity. HNSW performance with additional filters must be benchmarked.

A separate B-tree index on `document_id` may be useful for some query patterns, but it is not part of the currently confirmed schema. Add it only after evaluating actual query plans and workload performance.

## 8. PostgreSQL DDL

The following is the consolidated table definition.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_vector (
    internal_id BIGSERIAL PRIMARY KEY,

    document_id BIGINT NOT NULL
        REFERENCES document_meta (internal_id)
        ON DELETE CASCADE,

    chunk_index INTEGER NOT NULL
        CHECK (chunk_index >= 0),

    chunk_text TEXT NOT NULL,

    embedding VECTOR(3072) NOT NULL,

    CONSTRAINT document_vector_document_chunk_unique
        UNIQUE (document_id, chunk_index)
);

CREATE INDEX document_vector_embedding_hnsw_idx
ON document_vector
USING hnsw (embedding vector_cosine_ops);
```

**Execution prerequisites:**

- `pgvector` must be available and enabled in the target PostgreSQL environment.
- The `document_meta` table must already exist.
- The configured embedding model must produce compatible 3,072-dimensional vectors.
- The database deployment must support the chosen HNSW index configuration.

The DDL defines the confirmed table structure. Production migration files should be generated and reviewed through the project's database migration workflow.

## 9. PDF Processing and Embedding Pipeline

### 9.1 Proposed processing flow

```text
PDF upload
    |
    v
document_meta
    |
    v
PDF parsing with pdf-parse
    |
    v
Extracted text
    |
    v
Text normalization and chunking
    |
    v
Gemini gemini-embedding-001
    |
    v
3,072-dimensional embeddings
    |
    v
document_vector
```

This flow represents the text-based processing path.

The application should create and store chunk records only after the relevant extraction and embedding operations have produced valid outputs. Processing status and failure handling remain coordinated with `document_meta` and the processing workflow.

### 9.2 `pdf-parse` responsibilities

The selected PDF parsing approach is `pdf-parse`, based on the user's existing SIA experience.

It can be used to extract PDF text for downstream chunking and embedding.

However, extracting text from a PDF is not equivalent to understanding all its visual content. A PDF can contain diagrams, charts, scanned pages, screenshots, and other images whose information may not appear in the extracted text.

### 9.3 Embedded image handling

The selected `gemini-embedding-001` model is text-only. Therefore, it cannot directly create multimodal embeddings from the original PDF's images.

If NoteGenius must answer questions about information present only in diagrams, charts, scanned pages, or other visual content, the processing pipeline must include an additional capability, such as:

- OCR for extracting text from scanned pages and images.
- Vision-based processing for interpreting diagrams, charts, and visual relationships.
- A compatible multimodal embedding model if direct image-and-text embeddings are required.

The exact image-processing implementation remains part of the AI/document-processing design. The current schema can store embeddings generated from text extracted or described by those additional steps, provided the stored vectors remain compatible with the selected embedding space.

## 10. Data Integrity and Application Responsibilities

### 10.1 Database-enforced rules

The database enforces:

- Unique internal chunk identifiers.
- Valid foreign-key references to documents.
- Automatic deletion of chunks following permanent document deletion.
- Nonnegative chunk indexes.
- Unique chunk positions within each document.
- Non-null chunk text and embeddings.
- Fixed 3,072-dimensional embeddings.

### 10.2 Application responsibilities

The application and processing pipeline are responsible for:

- Extracting text from supported uploaded documents.
- Splitting extracted text into chunks.
- Assigning contiguous, zero-based chunk indexes.
- Generating embeddings using the configured model.
- Validating embedding dimensions before insertion.
- Handling processing failures and retries.
- Preventing access to chunks belonging to soft-deleted documents.
- Enforcing document ownership and authorization before retrieval.
- Coordinating document processing with `document_meta.processing_status`.
- Implementing re-embedding when the selected embedding model or configuration changes.
- Providing OCR or vision processing where image-based understanding is required.

## 11. Security and Performance Considerations

### Security

- Do not expose `internal_id` as a public API identifier by default.
- Validate document ownership and access permissions before returning chunks or using them as AI context.
- Treat extracted document content as untrusted input.
- Do not assume vector indexes enforce authorization.
- Apply document deletion and retention policies consistently across PostgreSQL and object storage.

### Performance

- Benchmark retrieval latency and recall using representative datasets and queries.
- Monitor HNSW index size, memory consumption, and index-build costs.
- Review query plans for document-filtered similarity searches.
- Avoid regenerating embeddings unnecessarily when existing vectors remain valid.
- Measure the effect of chunk size and overlap on retrieval quality.
- Plan for model migration and re-embedding if vector compatibility changes.

## 12. Dependencies and Future Implementation Work

The following implementation details remain outside the confirmed table schema:

1. **Chunking strategy:** Define chunk size, overlap, and text normalization.
2. **Image understanding:** Choose OCR, vision processing, or a multimodal model for image-only information.
3. **Re-embedding strategy:** Define how existing vectors are replaced when model compatibility changes.
4. **Additional indexes:** Benchmark document-filtered retrieval before adding a separate B-tree index.
5. **Migration execution:** Verify `pgvector` availability and the target deployment's HNSW support.

These items do not change the confirmed schema decisions.

## 13. Decision Summary

| Decision                    | Confirmed selection                                  |
| --------------------------- | ---------------------------------------------------- |
| Primary key                 | `internal_id BIGSERIAL PRIMARY KEY`                  |
| Document foreign key        | `document_id` references `document_meta.internal_id` |
| Permanent document deletion | `ON DELETE CASCADE`                                  |
| Chunk uniqueness            | `UNIQUE (document_id, chunk_index)`                  |
| Chunk index                 | Zero-based                                           |
| Chunk index type            | `INTEGER NOT NULL`, nonnegative                      |
| Chunk text                  | `TEXT NOT NULL`                                      |
| Embedding model             | Google `gemini-embedding-001`                        |
| Embedding dimension         | 3,072                                                |
| Embedding storage           | `VECTOR(3072)`                                       |
| Similarity metric           | Cosine distance                                      |
| Vector index                | HNSW with `vector_cosine_ops`                        |
| PDF text extraction         | `pdf-parse`                                          |
| Image understanding         | Additional OCR or vision processing to be designed   |

---

**Status: Confirmed**  
**Version: 1.0**

The `document_vector` table design is confirmed. The embedding model and dimension reflect the user's selected configuration and prior SIA experience. PDF image-understanding behavior remains a processing-pipeline responsibility rather than an assumption about the text-only embedding model.
