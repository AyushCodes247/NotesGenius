# NoteGenius — Requirements Specification

**Project:** NoteGenius — AI Notes Generator and Summarizer  
**Document:** `requirements.md`  
**Version:** 1.0  
**Date:** October 26, 2026  
**Status:** Done

---

## 1. Project Overview

### 1.1 Purpose

NoteGenius is an AI-powered application that transforms study materials into structured, easy-to-understand, revision-ready notes.

Users can upload supported documents, generate AI notes and quizzes, manage saved notes, control visibility, share notes with other users, and download generated content.

The project is intended to satisfy college requirements while demonstrating production-oriented software engineering skills for a professional portfolio.

### 1.2 Objectives

- Generate structured study notes from supported study materials.
- Provide persistent note management.
- Support private, shared, and public notes.
- Generate quizzes and allow users to practice answering questions.
- Support PDF and image exports.
- Provide a modern, minimal, responsive dark-themed interface.
- Implement secure authentication and authorization.
- Establish a maintainable architecture supported by automated tests, CI/CD, deployment, and technical documentation.

## 2. Project Scope

### 2.1 In Scope

- User registration and authentication.
- Document uploads and validation.
- AI notes generation.
- Persistent note management.
- Private and public visibility.
- Sharing with specific users through user handles.
- PDF and image exports.
- Quiz generation and practice.
- Downloadable generated content.
- Security, testing, CI/CD, deployment, and documentation.

### 2.2 Out of Scope for the Initial Release

- Scanned-document OCR, unless subsequently approved for PNG processing.
- Audio and video transcription.
- Collaborative real-time editing.
- Podcast generation.
- Complex multi-document retrieval.
- Native mobile applications.
- Offline AI inference.
- Subscription billing.
- Advanced analytics.

## 3. Functional Requirements

### FR-01 — User Registration and Authentication

The system shall support user registration and login through the authentication methods selected for the initial release.

Protected operations shall require valid authentication.

**Acceptance criteria:**

- Users can register and authenticate using the supported method.
- Invalid credentials are rejected.
- Protected API endpoints reject unauthenticated requests.
- Passwords are never stored in plaintext.

### FR-02 — Document Upload

The system shall accept the following file formats:

- PDF (`.pdf`)
- Microsoft Word (`.docx`)
- Plain text (`.txt`)
- Markdown (`.md`)
- PNG images (`.png`)

The maximum permitted size of an individual uploaded file shall be **4 MB**.

**Acceptance criteria:**

- Valid supported files are accepted.
- Files exceeding 4 MB are rejected.
- Unsupported or invalid files are rejected.
- Backend validation is enforced independently of frontend validation.
- Upload errors return useful feedback.

**Open question:** The intended text-extraction behavior for PNG images remains to be defined. OCR is outside the initial scope unless explicitly approved.

### FR-03 — AI Notes Generation

The system shall generate structured study notes from supported study materials.

Generated notes should support:

- Summaries.
- Headings and organized sections.
- Bullet points.
- Key takeaways.
- Important terms and concepts.

The application shall communicate processing status and provide useful feedback when generation fails.

### FR-04 — Persistent Note Management

The system shall allow authenticated users to create, retrieve, update, and delete saved notes.

**Acceptance criteria:**

- Saved notes persist in the database.
- Users can retrieve their notes in subsequent sessions.
- Unauthorized users cannot modify or delete another user's notes.
- Ownership and access permissions are enforced by the backend.

### FR-05 — Note Visibility

The system shall support three visibility states:

1. **Private:** Accessible only to the owner and authorized system processes.
2. **Shared:** Accessible to specifically authorized users.
3. **Public:** Accessible to other users according to the application's public-access rules.

Notes shall be private by default.

**Acceptance criteria:**

- Newly created notes are private unless the owner explicitly changes their visibility.
- Only authorized users can change visibility.
- Private notes are not exposed through public endpoints.
- Access permissions remain enforced when visibility changes.

### FR-06 — Sharing Notes by User Handle

The system shall allow users to share notes with other registered users through unique user handles, such as `@user_handle`.

**Acceptance criteria:**

- The system identifies recipients using their unique handles.
- Only authorized users can grant or revoke access to their notes.
- Recipients can access shared notes according to the defined permissions.
- Unauthorized users cannot access shared notes.
- Sharing permissions are enforced on the backend.

### FR-07 — Notes Export

The system shall support exporting generated notes into the following formats when requested by the user:

- PDF (`.pdf`)
- PNG image (`.png`)

The precise image-export layout, page handling, and rendering behavior shall be defined during design.

### FR-08 — Downloadable Output

The system shall allow users to download generated notes and supported export files.

**Acceptance criteria:**

- Generated exports can be downloaded in their selected format.
- Downloads respect note ownership, visibility, and sharing permissions.
- Invalid or unavailable export requests return useful errors.

### FR-09 — Quiz Generation and Practice

The system shall allow users to generate quizzes from supported study materials and practice answering questions.

**Acceptance criteria:**

- Users can request quiz generation from eligible study material.
- Generated questions are presented in a usable practice interface.
- Users can submit answers and receive feedback according to the quiz rules.

**Open questions:** Supported question types, answer explanations, scoring, difficulty levels, and quiz persistence remain to be defined.

## 4. Non-Functional Requirements

### NFR-01 — Performance

Ordinary read and write operations should generally complete within **400 ms end-to-end** under the defined normal operating workload.

This is a performance target, not a hard timeout for every request.

**Acceptance criteria and engineering policy:**

- Measure time from the client initiating a request until the response is received.
- Measure latency separately by operation type.
- Investigate and optimize operations that regularly exceed the target.
- Define representative workloads during capacity modeling.
- Establish a quantitative definition of "majority" and any percentile targets during performance planning.
- Treat AI generation and document exports separately, with their own performance criteria.

### NFR-02 — Authentication and Session Security

The system shall use JWT-based access tokens and stateful refresh tokens.

**Requirements:**

- Access tokens authenticate requests to protected API endpoints.
- Token signatures, expiration, and relevant claims shall be validated.
- Refresh-token sessions shall maintain server-side state.
- Refresh-token rotation and revocation shall be supported according to the finalized session policy.
- Logout shall invalidate the applicable session.
- Authentication failures shall not grant access to protected resources.

### NFR-03 — Authorization and Privacy

The system shall enforce ownership and access permissions for notes and other protected resources.

**Requirements:**

- Notes are private by default.
- Public visibility and explicit sharing are distinct access-control states.
- A valid JWT alone does not grant access to another user's private resources.
- Authorization shall be checked on the backend for every protected operation.
- Cached data must not bypass current authorization rules.

### NFR-04 — Data Integrity

The system shall maintain consistent ownership, note content, visibility settings, and sharing permissions during creation, updates, sharing, and deletion.

Recovery objectives and backup policies shall be established during operational design.

### NFR-05 — Maintainability

The application shall use a modular architecture with clear separation of responsibilities.

The implementation shall support understandable code, documented design decisions, maintainable configuration, and incremental development.

### NFR-06 — Testability

The application shall support automated testing of critical behavior, including:

- Unit tests for application logic.
- Integration tests for API and database behavior.
- Authentication and authorization tests.
- File validation tests.
- Sharing and visibility tests.
- Error-handling and failure-path tests.

### NFR-07 — Reliability and Error Handling

The system shall handle invalid input, database failures, document-processing failures, and AI-provider failures predictably.

Errors shall provide useful feedback without exposing secrets, credentials, or sensitive internal implementation details.

### NFR-08 — Usability and Accessibility

The interface shall be minimal, modern, easy to navigate, and responsive across supported screen sizes.

The initial design shall use a dark theme. Specific accessibility criteria and supported browser/device requirements shall be established during design.

### NFR-09 — Scalability

The application shall be designed to support the workload defined during capacity modeling.

Capacity assumptions, concurrency targets, throughput requirements, and scaling thresholds shall be established before infrastructure decisions are finalized.

### NFR-10 — Observability

The application shall provide useful logs and performance measurements for diagnosing failures and identifying slow operations.

Logs and metrics shall not unnecessarily expose passwords, tokens, secrets, or private note contents.

### NFR-11 — File Processing Security

The system shall validate uploaded files on the backend, enforce the file-size limit, restrict accepted formats, and handle malformed or malicious input safely.

Document processing shall not be allowed to bypass authorization or expose unauthorized data.

### NFR-12 — Session Storage and Cache Isolation

Redis is proposed for both application caching and refresh-token/session state, with separate Redis instances or managed deployments for the two workloads.

**Requirements:**

- Application cache entries may use an LFU eviction policy, subject to validation against observed access patterns.
- Session storage shall not use ordinary cache eviction.
- A `noeviction` policy is proposed for the session store, with explicit expiration and memory planning.
- Refresh operations shall fail safely if session validity cannot be verified.
- Session updates and refresh-token rotation shall handle concurrent requests safely.
- Persistence, replication, recovery, and availability settings shall be defined during operational design.

## 5. Proposed Technology Stack

| Layer                    | Proposed technology                                                |
| ------------------------ | ------------------------------------------------------------------ |
| Frontend                 | React + TypeScript                                                 |
| Styling                  | Tailwind CSS                                                       |
| Backend                  | Node.js + TypeScript + Express                                     |
| Application architecture | Modular monolith                                                   |
| Primary database         | PostgreSQL                                                         |
| ORM and migrations       | Drizzle ORM                                                        |
| Authentication           | JWT access tokens and stateful refresh tokens                      |
| Cache and session state  | Redis                                                              |
| AI integration           | External LLM API accessed securely through the backend             |
| Document processing      | PDF, DOCX, TXT, and Markdown parsing; PNG handling to be finalized |
| Testing                  | Vitest or Jest, plus API integration tests                         |
| Version control          | Git                                                                |
| Automation               | CI/CD pipeline                                                     |
| Deployment               | Frontend hosting, backend hosting, and managed database services   |

This stack is a proposed baseline. Final decisions shall follow documented technology evaluations and capacity modeling.

## 6. Security Design Principles

- Store passwords using an appropriate password-hashing algorithm.
- Keep API keys and secrets outside source control.
- Validate input and enforce access controls on the backend.
- Store refresh-token session state separately from evictable application cache data.
- Avoid storing raw refresh tokens when a secure token-hashing strategy is appropriate.
- Protect Redis access through appropriate network and authentication controls.
- Define refresh-token rotation, reuse detection, revocation, and session expiration policies.
- Ensure public and shared note access cannot expose private notes.
- Handle cache invalidation when note content or permissions change.

## 7. Project Deliverables

The project shall produce:

1. `requirements.md` — requirements specification.
2. Capacity modeling and workload assumptions.
3. Technology selection and trade-off documentation.
4. High-level architecture and component responsibilities.
5. Database schema and migration design.
6. API specifications and error conventions.
7. Authentication, authorization, and sharing security design.
8. Testing and operational design.
9. Working frontend and backend application.
10. Automated tests and CI/CD pipeline.
11. Deployment and setup documentation.
12. README and supporting technical documentation.
13. College presentation and end-to-end demonstration.

## 8. Development Methodology

Development shall proceed in two phases.

### Phase 1 — System Design and Architecture

Complete and review requirements, capacity modeling, technology decisions, architecture, database schema, API contracts, security, and operational design before feature implementation.

### Phase 2 — Hybrid Development

Follow the engineering lifecycle:

**Development → Testing → CI/CD → Production**

Repeat the cycle incrementally. Implementation findings shall inform revisions to the design documents where necessary.

## 9. Timeline and Priority

- Internal target: mid-November 2026.
- College theme submission deadline: end of November 2026.
- NoteGenius takes priority over Java P042.
- VidMod work resumes after NoteGenius is sufficiently complete.

The detailed schedule shall be established based on available time, remaining requirements, and implementation complexity.

## 10. Open Questions and Deferred Decisions

The following decisions remain open and shall be resolved in the appropriate design phase:

1. Whether PNG input requires OCR or another extraction mechanism.
2. Registration method and account recovery requirements.
3. Access-token and refresh-token lifetimes and storage details.
4. Exact refresh-token rotation and reuse-detection policy.
5. Redis persistence, replication, recovery, and operational configuration.
6. AI provider, model, input limits, output limits, and language support.
7. Quiz question types, scoring, explanations, and difficulty settings.
8. Export rendering and multi-page image behavior.
9. Performance targets for AI generation and exports.
10. Numerical workload, concurrency, throughput, and capacity assumptions.
11. Availability, backup, recovery, and data-retention targets.
12. Supported browsers, accessibility criteria, and additional usability requirements.

Open questions are intentionally retained rather than replaced with unverified assumptions.

## 11. Completion Criteria

The requirements phase is considered complete when the requirements document has been reviewed, the agreed scope and constraints are recorded, and unresolved decisions have been identified for the appropriate subsequent design activities.

The implementation phase shall use these requirements as the basis for detailed design, development, and verification.

---

**End of requirements specification**
