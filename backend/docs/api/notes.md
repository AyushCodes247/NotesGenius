# NoteGenius — API Design

**Version:** 1.0  
**Status:** Draft for Review  
**Base Path:** `/api/v1`

## 1. API Conventions

### 1.1 Protocol and Methods

- **Protocol:** HTTP API; use HTTPS in production.
- **Methods:** `GET`, `POST`, `PATCH`, `DELETE`, and `PUT` where full replacement semantics are needed.
- **Request/response format:** JSON, except file uploads, which use `multipart/form-data`.
- **Authentication:** JWT access token in the `Authorization` header.
- **API versioning:** `/api/v1`.

### 1.2 HTTP Status Codes

| Status                       | Usage                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `200 OK`                     | Successful reads, updates, and actions returning a response |
| `201 Created`                | Successful resource creation                                |
| `400 Bad Request`            | Invalid request or malformed input                          |
| `401 Unauthorized`           | Missing, invalid, or expired access token                   |
| `403 Forbidden`              | Authenticated user lacks permission                         |
| `404 Not Found`              | Resource does not exist or is not accessible                |
| `409 Conflict`               | Duplicate handle or conflicting resource state              |
| `413 Content Too Large`      | Upload exceeds the 4 MB limit                               |
| `415 Unsupported Media Type` | Unsupported upload format                                   |
| `422 Unprocessable Content`  | Valid JSON that fails semantic validation                   |
| `429 Too Many Requests`      | Rate limit exceeded                                         |
| `500 Internal Server Error`  | Unexpected server failure                                   |
| `502 Bad Gateway`            | Upstream service failure                                    |
| `503 Service Unavailable`    | Service temporarily unavailable                             |
| `504 Gateway Timeout`        | Upstream operation timed out                                |

The HTTP status code is the authoritative indication of success or failure. JSON responses also contain a `success` field for consistency.

### 1.3 Standard Response Structure

Successful response:

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found"
  }
}
```

All resource identifiers returned to clients use public identifiers, such as `user_public_id`, `note_public_id`, and `quiz_public_id`. Internal database IDs must not be exposed.

### 1.4 Authentication and Authorization

- Protected endpoints require `Authorization: Bearer <access_token>`.
- The authenticated user's identity is derived from the validated token.
- Clients must not send `public_id` to determine which user owns a resource.
- The backend enforces ownership, visibility, and sharing permissions.
- Refresh tokens are transmitted using a secure, `HttpOnly` cookie and are not exposed in ordinary JSON responses.
- Input validation is performed at API boundaries.

---

## 2. Notes

The Notes section manages document uploads, note generation, note metadata and content, topic chat, exports, sharing, and visibility.

### 2.1 Upload Study Material

**Endpoint:** `POST /api/v1/notes/uploads`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`  
**Success:** `201 Created`

Multipart fields:

- `file`: The uploaded document.
- `title` (optional): A user-provided title for the resulting note.

Supported formats: PDF, DOCX, TXT, and MD. PNG support remains subject to confirmation of the image-processing/OCR requirement.

Maximum file size: **4 MB per file**.

Response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "note": {
      "public_id": "note_public_id",
      "title": "Study Notes",
      "source": {
        "file_public_id": "file_public_id",
        "filename": "study_material.pdf",
        "processing_status": "uploaded"
      },
      "visibility": "private",
      "created_at": "2026-10-27T15:00:00Z"
    }
  }
}
```

The uploaded file is associated with the authenticated user. Uploading a file and generating notes are distinct operations so that processing failures can be tracked and retried.

### 2.2 Generate Notes

**Endpoint:** `POST /api/v1/notes/{noteId}/generate`  
**Authentication:** Required  
**Success:** `201 Created` when a generation job is created.

Request:

```json
{
  "command": "@create",
  "level": "moderate"
}
```

Supported commands include:

- `@summarize`
- `@create`
- `@bulletpoints`
- `@short-summary`
- `@explain`

The `level` field supports `low`, `moderate`, and `high`, with `low` as the default where applicable.

Response:

```json
{
  "success": true,
  "message": "Note generation started successfully",
  "data": {
    "job_public_id": "job_public_id",
    "note_public_id": "note_public_id",
    "status": "queued"
  }
}
```

The job ID and status allow the frontend to track longer-running AI operations. A job-status endpoint should be added to the final route inventory if asynchronous processing is adopted.

### 2.3 Get Notes Metadata

**Endpoint:** `GET /api/v1/notes`  
**Authentication:** Required  
**Success:** `200 OK`

Returns a paginated list of notes the authenticated user is allowed to access, including metadata for the document library.

Response:

```json
{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": {
    "items": [
      {
        "public_id": "note_public_id",
        "title": "Study Notes",
        "visibility": "private",
        "processing_status": "completed",
        "created_at": "2026-10-27T15:00:00Z",
        "updated_at": "2026-10-27T15:10:00Z"
      }
    ],
    "pagination": {
      "next_cursor": null,
      "has_more": false
    }
  }
}
```

### 2.4 Get a Single Note

**Endpoint:** `GET /api/v1/notes/{noteId}`  
**Authentication:** Required  
**Success:** `200 OK`

Returns metadata and generated note content when the requester has permission.

Response:

```json
{
  "success": true,
  "message": "Note retrieved successfully",
  "data": {
    "note": {
      "public_id": "note_public_id",
      "title": "Study Notes",
      "content": "Generated structured notes...",
      "visibility": "private",
      "processing_status": "completed",
      "created_at": "2026-10-27T15:00:00Z",
      "updated_at": "2026-10-27T15:10:00Z"
    }
  }
}
```

### 2.5 Update a Note

**Endpoint:** `PATCH /api/v1/notes/{noteId}`  
**Authentication:** Required  
**Success:** `200 OK`

Request:

```json
{
  "title": "Updated Study Notes",
  "content": "Updated note content..."
}
```

Only permitted fields are editable. The backend checks ownership or edit permissions before applying changes.

### 2.6 Delete a Note

**Endpoint:** `DELETE /api/v1/notes/{noteId}`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "Note deleted successfully",
  "data": {}
}
```

Deletion must enforce ownership and account for related resources, such as exports, source files, and quiz references, according to the retention policy.

### 2.7 Ask a Question or Issue a Command

**Endpoint:** `POST /api/v1/notes/{noteId}/chat`  
**Authentication:** Required  
**Success:** `200 OK` for a completed synchronous response.

Request:

```json
{
  "message": "Explain this topic in simple terms",
  "command": "@explain",
  "level": "low"
}
```

Response:

```json
{
  "success": true,
  "message": "Response generated successfully",
  "data": {
    "note_public_id": "note_public_id",
    "content": "The generated explanation...",
    "created_at": "2026-10-27T15:20:00Z"
  }
}
```

The backend validates access to the referenced note before invoking AI capabilities through the orchestration module and MCP integration.

### 2.8 Export a Note

**Endpoint:** `POST /api/v1/notes/{noteId}/exports`  
**Authentication:** Required  
**Success:** `201 Created`

Request:

```json
{
  "format": "pdf"
}
```

Supported formats: `pdf`, `png`, and `jpg`.

Response:

```json
{
  "success": true,
  "message": "Export requested successfully",
  "data": {
    "export_public_id": "export_public_id",
    "status": "queued"
  }
}
```

### 2.9 Get Export Status and Download Link

**Endpoint:** `GET /api/v1/notes/{noteId}/exports/{exportId}`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "Export status retrieved successfully",
  "data": {
    "export_public_id": "export_public_id",
    "format": "pdf",
    "status": "completed",
    "downloadable_link": "time_limited_download_url"
  }
}
```

The download link should be time-limited and issued only after authorization checks.

### 2.10 Share a Note

**Endpoint:** `POST /api/v1/notes/{noteId}/shares`  
**Authentication:** Required  
**Success:** `201 Created`

Request:

```json
{
  "userhandle": "@another_user"
}
```

Response:

```json
{
  "success": true,
  "message": "Note shared successfully",
  "data": {
    "note_public_id": "note_public_id",
    "shared_with": [
      {
        "userhandle": "@another_user"
      }
    ]
  }
}
```

The backend resolves the handle to a user and creates a direct-share permission. The client does not choose the target user's internal database ID.

### 2.11 Change Note Visibility

**Endpoint:** `PATCH /api/v1/notes/{noteId}/visibility`  
**Authentication:** Required  
**Success:** `200 OK`

Request:

```json
{
  "visibility": "private"
}
```

Allowed values: `private`, `public`.

Response:

```json
{
  "success": true,
  "message": "Note visibility updated successfully",
  "data": {
    "note_public_id": "note_public_id",
    "visibility": "private"
  }
}
```

Private notes are accessible only to their owner and explicitly authorized users. Public visibility and direct sharing are separate access mechanisms.

---

## 3. Cross-Cutting Requirements

### 3.1 Resource Ownership and Access Control

Every protected resource operation must verify the authenticated user's ownership or explicit access permission. Knowing a public identifier must never be sufficient to access a private resource.

### 3.2 AI and MCP Integration

The frontend communicates with the core backend API. The backend's AI orchestration module validates requests, applies application policies, and invokes approved MCP capabilities over Streamable HTTP.

The MCP server does not replace public application endpoints and does not become the authority for user identity, resource ownership, or business permissions.

### 3.3 Long-Running Operations

Document processing, AI generation, and exports may take longer than ordinary API requests. Where synchronous execution is unreliable, the API returns a job or export identifier and a status that the client can poll. The final job-status routes must be included in the endpoint inventory once the job-processing design is finalized.

### 3.4 Validation and Security

- Validate request bodies, path parameters, query parameters, and uploaded files.
- Enforce the 4 MB upload limit and allowed file formats.
- Store passwords as secure password hashes.
- Protect refresh tokens and enforce revocation.
- Keep answer keys and other private data out of unauthorized responses.
- Apply rate limits to authentication, uploads, and AI-intensive operations.
- Avoid returning internal stack traces, secrets, or sensitive database details.
- Use transactions for operations that must persist together, especially quiz submission and result recording.

### 3.5 API Contract and Testing

The finalized contract should be represented in OpenAPI and used to guide request validation, response validation, integration tests, and frontend integration.
