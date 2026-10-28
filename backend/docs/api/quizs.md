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

## 2. Quizzes

The Quizzes section manages quiz generation, metadata retrieval, question and answer handling, attempts, scoring, sharing, visibility, and user-performance analytics.

### 2.1 Generate a Quiz

**Endpoint:** `POST /api/v1/quizzes`  
**Authentication:** Required  
**Success:** `201 Created`

Request:

```json
{
  "title": "Linear Algebra Practice",
  "topic": "Matrix theory",
  "difficulty": "moderate",
  "number_of_questions": 15,
  "note_public_id": "note_public_id"
}
```

Validation rules:

- `number_of_questions` must be exactly `5`, `10`, or `15`.
- Minimum: `5` questions.
- Maximum: `15` questions.
- `difficulty` must be `low`, `moderate`, or `high`.
- `note_public_id` is optional when a quiz is generated from a supplied topic or other supported source.
- The backend verifies access to the source note, when provided.

Response:

```json
{
  "success": true,
  "message": "Quiz generated successfully",
  "data": {
    "quiz": {
      "public_id": "quiz_public_id",
      "title": "Linear Algebra Practice",
      "difficulty": "moderate",
      "number_of_questions": 15,
      "visibility": "private",
      "created_at": "2026-10-27T15:30:00Z",
      "questions": [
        {
          "public_id": "question_public_id",
          "text": "What is a matrix?",
          "options": [
            {
              "public_id": "option_a",
              "text": "A rectangular arrangement of elements"
            },
            {
              "public_id": "option_b",
              "text": "A single scalar value"
            }
          ]
        }
      ]
    }
  }
}
```

The example displays one question for brevity; actual responses contain the requested 5, 10, or 15 questions.

Correct answers are stored securely on the server and must not be exposed to the client before the attempt is submitted.

### 2.2 Get Quiz Metadata

**Endpoint:** `GET /api/v1/quizzes`  
**Authentication:** Required  
**Success:** `200 OK`

Returns a paginated list of quizzes accessible to the authenticated user.

Response:

```json
{
  "success": true,
  "message": "Quizzes retrieved successfully",
  "data": {
    "items": [
      {
        "public_id": "quiz_public_id",
        "title": "Linear Algebra Practice",
        "difficulty": "moderate",
        "number_of_questions": 15,
        "visibility": "private",
        "created_at": "2026-10-27T15:30:00Z",
        "updated_at": "2026-10-27T15:30:00Z"
      }
    ],
    "pagination": {
      "next_cursor": null,
      "has_more": false
    }
  }
}
```

This endpoint provides the metadata needed for the quiz library without requiring the client to fetch every question and answer.

### 2.3 Get a Single Quiz

**Endpoint:** `GET /api/v1/quizzes/{quizId}`  
**Authentication:** Required  
**Success:** `200 OK`

Returns quiz metadata and questions/options for practice, subject to authorization. Correct answers remain hidden until submission or the appropriate review stage.

Response:

```json
{
  "success": true,
  "message": "Quiz retrieved successfully",
  "data": {
    "quiz": {
      "public_id": "quiz_public_id",
      "title": "Linear Algebra Practice",
      "difficulty": "moderate",
      "number_of_questions": 15,
      "questions": [
        {
          "public_id": "question_public_id",
          "text": "What is a matrix?",
          "options": [
            {
              "public_id": "option_a",
              "text": "A rectangular arrangement of elements"
            },
            {
              "public_id": "option_b",
              "text": "A single scalar value"
            }
          ]
        }
      ]
    }
  }
}
```

### 2.4 Update Quiz Metadata

**Endpoint:** `PATCH /api/v1/quizzes/{quizId}`  
**Authentication:** Required  
**Success:** `200 OK`

Request:

```json
{
  "title": "Revised Linear Algebra Practice",
  "difficulty": "high"
}
```

This route updates editable quiz metadata in the database. It must not overwrite user-attempt records or silently change historical scores. Whether editing questions is allowed is a separate policy decision.

### 2.5 Delete a Quiz

**Endpoint:** `DELETE /api/v1/quizzes/{quizId}`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "Quiz deleted successfully",
  "data": {}
}
```

Deletion must enforce ownership and follow the chosen retention policy for associated attempts and analytics.

### 2.6 Start a Quiz Attempt

**Endpoint:** `POST /api/v1/quizzes/{quizId}/attempts`  
**Authentication:** Required  
**Success:** `201 Created`

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Quiz attempt started successfully",
  "data": {
    "attempt_public_id": "attempt_public_id",
    "quiz_public_id": "quiz_public_id",
    "status": "in_progress",
    "started_at": "2026-10-27T15:40:00Z"
  }
}
```

The backend associates the attempt with the authenticated user and the selected quiz.

### 2.7 Update Attempt Answers

**Endpoint:** `PATCH /api/v1/quizzes/{quizId}/attempts/{attemptId}`  
**Authentication:** Required  
**Success:** `200 OK`

This route saves or updates the user's answers in the database during practice.

Request:

```json
{
  "answers": [
    {
      "question_public_id": "question_public_id",
      "selected_option_public_id": "option_a"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "message": "Quiz answers saved successfully",
  "data": {
    "attempt_public_id": "attempt_public_id",
    "status": "in_progress",
    "answered_questions": 1,
    "total_questions": 15,
    "updated_at": "2026-10-27T15:42:00Z"
  }
}
```

Rules:

- Only the attempt owner can update answers.
- The attempt must be in `in_progress` state.
- Each question and selected option must belong to the referenced quiz.
- The server does not accept client-supplied scores or correctness flags.
- Submitted attempts cannot be edited unless a deliberate retake or reopening policy is introduced.

### 2.8 Submit and Evaluate an Attempt

**Endpoint:** `POST /api/v1/quizzes/{quizId}/attempts/{attemptId}/submit`  
**Authentication:** Required  
**Success:** `200 OK`

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "message": "Quiz attempt evaluated successfully",
  "data": {
    "attempt_public_id": "attempt_public_id",
    "quiz_public_id": "quiz_public_id",
    "status": "submitted",
    "score": 12,
    "total_questions": 15,
    "percentage": 80,
    "submitted_at": "2026-10-27T15:45:00Z",
    "results": [
      {
        "question_public_id": "question_public_id",
        "selected_option_public_id": "option_a",
        "correct_option_public_id": "option_a",
        "is_correct": true,
        "explanation": "The selected option is correct."
      }
    ]
  }
}
```

The example shows one result entry for brevity. The full response may include results for every question.

The backend evaluates answers against the stored answer key and persists the final score and per-question results. Finalization and score persistence should be transactional and safe against duplicate submissions.

### 2.9 Get Attempt History

**Endpoint:** `GET /api/v1/quizzes/{quizId}/attempts`  
**Authentication:** Required  
**Success:** `200 OK`

Returns the authenticated user's attempts for the specified quiz.

Response:

```json
{
  "success": true,
  "message": "Quiz attempt history retrieved successfully",
  "data": {
    "items": [
      {
        "attempt_public_id": "attempt_public_id",
        "status": "submitted",
        "score": 12,
        "total_questions": 15,
        "percentage": 80,
        "started_at": "2026-10-27T15:40:00Z",
        "submitted_at": "2026-10-27T15:45:00Z"
      }
    ],
    "pagination": {
      "next_cursor": null,
      "has_more": false
    }
  }
}
```

### 2.10 Get an Individual Attempt

**Endpoint:** `GET /api/v1/quizzes/{quizId}/attempts/{attemptId}`  
**Authentication:** Required  
**Success:** `200 OK`

Returns the attempt state, saved answers, and—after submission—the evaluated results. Correct answers and explanations must only be revealed according to the quiz-review policy.

### 2.11 Share a Quiz

**Endpoint:** `POST /api/v1/quizzes/{quizId}/shares`  
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
  "message": "Quiz shared successfully",
  "data": {
    "quiz_public_id": "quiz_public_id",
    "shared_with": [
      {
        "userhandle": "@another_user"
      }
    ]
  }
}
```

The backend resolves the handle and creates a direct-share permission after checking ownership.

### 2.12 Change Quiz Visibility

**Endpoint:** `PATCH /api/v1/quizzes/{quizId}/visibility`  
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
  "message": "Quiz visibility updated successfully",
  "data": {
    "quiz_public_id": "quiz_public_id",
    "visibility": "private"
  }
}
```

Public visibility and direct sharing are separate permissions.

### 2.13 Get User Quiz Analytics Summary

**Endpoint:** `GET /api/v1/quizzes/analytics/summary`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "Quiz analytics retrieved successfully",
  "data": {
    "total_attempts": 12,
    "average_percentage": 76.5,
    "best_percentage": 100,
    "completed_attempts": 12
  }
}
```

Only finalized attempts should contribute to submitted-score metrics unless a metric explicitly defines otherwise.

### 2.14 Get Quiz Performance History

**Endpoint:** `GET /api/v1/quizzes/analytics/history`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "Quiz performance history retrieved successfully",
  "data": {
    "items": [
      {
        "attempt_public_id": "attempt_public_id",
        "quiz_public_id": "quiz_public_id",
        "quiz_title": "Linear Algebra Practice",
        "score": 12,
        "total_questions": 15,
        "percentage": 80,
        "submitted_at": "2026-10-27T15:45:00Z"
      }
    ]
  }
}
```

The consistent score, total-question count, percentage, and submission timestamp fields support score cards, attempt history, and charts showing performance over time.

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
