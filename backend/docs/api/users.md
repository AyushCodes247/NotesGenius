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

## 2. Users

The Users section manages registration, authentication, user profiles, unique handles, and sessions.

### 2.1 Register

**Endpoint:** `POST /api/v1/auth/register`  
**Authentication:** Not required  
**Success:** `201 Created`

Request:

```json
{
  "username": "user_name",
  "email": "user@example.com",
  "password": "strong_password"
}
```

Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "public_id": "user_public_id",
      "username": "user_name",
      "email": "user@example.com",
      "userhandle": "@user_handle"
    },
    "accessToken": "access_token"
  }
}
```

**Rules:**

- Email must be valid and unique.
- Passwords must be securely hashed before persistence.
- The user handle must be unique. Handle creation during registration or as a separate operation must follow the finalized account-setup policy.

### 2.2 Login

**Endpoint:** `POST /api/v1/auth/login`  
**Authentication:** Not required  
**Success:** `200 OK`

Request:

```json
{
  "email": "user@example.com",
  "password": "strong_password"
}
```

Response:

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "public_id": "user_public_id",
      "username": "user_name",
      "email": "user@example.com",
      "userhandle": "@user_handle"
    },
    "accessToken": "access_token"
  }
}
```

The refresh token is set through the configured secure cookie mechanism.

### 2.3 Get Profile

**Endpoint:** `GET /api/v1/users/me`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "public_id": "user_public_id",
      "username": "user_name",
      "email": "user@example.com",
      "userhandle": "@user_handle"
    }
  }
}
```

### 2.4 Update Profile

**Endpoint:** `PATCH /api/v1/users/me`  
**Authentication:** Required  
**Success:** `200 OK`

Request:

```json
{
  "username": "updated_name"
}
```

Only explicitly editable profile fields can be updated through this endpoint. Email and password changes, if supported, require appropriate verification flows.

### 2.5 Create or Update Handle

**Endpoint:** `PUT /api/v1/users/me/handle`  
**Authentication:** Required  
**Success:** `200 OK`

Request:

```json
{
  "userhandle": "@new_handle"
}
```

Response:

```json
{
  "success": true,
  "message": "User handle updated successfully",
  "data": {
    "user": {
      "public_id": "user_public_id",
      "username": "user_name",
      "userhandle": "@new_handle"
    }
  }
}
```

**Rules:**

- Handles must be unique and validated against the allowed format.
- A uniqueness conflict returns `409 Conflict`.
- Whether users can change their handles repeatedly remains a product-policy decision.

### 2.6 Refresh Access Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Authentication:** Valid refresh-token cookie required  
**Success:** `200 OK`

Request: The refresh token is supplied through the configured cookie, not the JSON body.

Response:

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "new_access_token"
  }
}
```

Refresh-token rotation and revocation must be implemented according to the session-security policy.

### 2.7 Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Authentication:** Required  
**Success:** `200 OK`

Response:

```json
{
  "success": true,
  "message": "User logged out successfully",
  "data": {}
}
```

The backend revokes the relevant refresh session and clears the refresh-token cookie.

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
