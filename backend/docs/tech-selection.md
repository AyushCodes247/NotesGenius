# NoteGenius — Technology Selection

**Document:** `docs/technology-selection.md`  
**Version:** 1.0  
**Status:** Done  
**Date:** October 26, 2026

## 1. Purpose

This document records the selected technology stack for NoteGenius, an AI-powered notes generator and summarizer. It defines the responsibilities of each technology, the rationale for its selection, and the remaining decisions that belong to later design phases.

The selected stack supports a modular application, maintainable development, secure data access, automated testing, and a production deployment workflow.

## 2. Selected Technology Stack

| Layer                   | Selected technology                          | Responsibility                                         |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Frontend framework      | React                                        | Component-based user interface                         |
| Frontend language       | TypeScript                                   | Static typing and maintainability                      |
| Client state management | Redux Toolkit                                | Shared client-side state                               |
| Styling                 | Tailwind CSS                                 | Responsive UI styling                                  |
| Animation               | Motion                                       | UI transitions and interaction animations              |
| Backend runtime         | Node.js                                      | Server-side JavaScript execution                       |
| Backend language        | TypeScript                                   | Backend implementation                                 |
| Package manager         | pnpm                                         | Dependency management and reproducible installs        |
| HTTP framework          | Express                                      | Routing, middleware, and request handling              |
| Primary database        | PostgreSQL                                   | Durable relational application data                    |
| ORM and migrations      | Drizzle ORM                                  | Typed database access and schema migration management  |
| Vector search           | pgvector                                     | Embedding storage and similarity search                |
| Object storage          | S3-compatible storage                        | Uploaded source files and generated exports            |
| Cache and session store | Redis                                        | Application caching and refresh-token/session state    |
| AI integration          | External LLM API                             | Note generation, summarization, and question answering |
| Testing                 | Automated unit and integration tests         | Correctness and regression prevention                  |
| CI/CD                   | Automated validation and deployment pipeline | Repeatable testing and delivery                        |

The table records the selected technology baseline. Specific library versions, hosting providers, deployment configurations, and some implementation details will be decided in their respective design phases.

## 3. Frontend Technology Decisions

### 3.1 React and TypeScript

**Decision:** Use React with TypeScript.

React provides the component-based UI framework, while TypeScript supports clearer interfaces and static type checking.

### 3.2 Redux Toolkit

**Decision:** Use Redux Toolkit for shared client-side application state.

Server-state fetching, caching, and invalidation will be evaluated separately. Redux Toolkit Query is a candidate where its capabilities fit the API and frontend requirements.

### 3.3 Tailwind CSS

**Decision:** Use Tailwind CSS for styling and responsive layouts.

The UI should remain consistent, accessible, responsive, and aligned with the project's minimal, modern visual direction.

### 3.4 Motion

**Decision:** Use Motion for interface animations and transitions.

Animations must respect reduced-motion preferences and must not interfere with accessibility or usability.

## 4. Backend Technology Decisions

### 4.1 Node.js and TypeScript

**Decision:** Use Node.js as the backend runtime and TypeScript as the implementation language.

This establishes a consistent language across the frontend and backend while keeping the server-side execution environment explicit.

### 4.2 Express

**Decision:** Use Express as the HTTP framework.

Express will handle routes, middleware, request validation integration, and HTTP responses. Business logic and data access should remain in appropriately separated application modules rather than being embedded directly in route handlers.

### 4.3 pnpm

**Decision:** Use pnpm as the package manager.

**Rationale:**

- Provides a dedicated dependency-management workflow.
- Supports reproducible installations through a committed `pnpm-lock.yaml`.
- Supports workspaces if the repository later needs shared packages.
- Allows Node.js to remain the selected runtime independently of package management.

The Node.js version, pnpm version, dependency-update policy, and CI installation commands will be recorded in the development and CI/CD configuration.

## 5. Data Technology Decisions

### 5.1 PostgreSQL

**Decision:** Use PostgreSQL as the primary database and system of record for durable application data.

PostgreSQL will store:

- User accounts and handles.
- Notes, note ownership, visibility, and sharing relationships.
- Uploaded-document metadata and processing status.
- Quiz definitions, questions, attempts, and results.
- Conversation history and related relational metadata, as appropriate.
- Long-term context records and their lifecycle metadata.
- Other structured application data defined by the approved API and database designs.

The final table structure, relationships, constraints, and indexes will be established after API design.

### 5.2 Drizzle ORM

**Decision:** Use Drizzle ORM for typed PostgreSQL access and migration management.

Schema definitions and migrations must be version-controlled. Database changes should be applied through a controlled migration workflow across development, testing, and production environments.

### 5.3 pgvector

**Decision:** Use pgvector as the PostgreSQL vector-search extension.

The intended use is to support semantic retrieval over embeddings associated with notes and source-document chunks. Retrieval results must be linked to their source content so the application can apply ownership and authorization rules.

The following remain to be finalized:

- Embedding model and dimensions.
- Distance metric.
- Vector index type and configuration.
- Chunking and metadata strategy.
- Re-embedding behavior when content or embedding models change.

### 5.4 Conversation history and long-term context

**Decision:** Use PostgreSQL rather than adding a separate document database.

Conversation messages, summaries, and selected long-term context will be represented using relational tables and, where justified, PostgreSQL JSONB fields.

The design must distinguish:

- Persisted conversation messages.
- A bounded recent-message context used to construct AI prompts.
- Conversation summaries.
- Selected durable context and its provenance.

Conversation history should be persisted incrementally rather than saved only when a conversation ends. An in-memory array may be used as a temporary working buffer, but it must not be the sole copy of a conversation.

The API and database design phases will define the exact data structures and lifecycle behavior.

## 6. Object Storage

**Decision:** Use S3-compatible object storage for uploaded source documents and generated exports.

Object storage will hold file bytes, including supported source documents and generated PDF/image exports.

PostgreSQL will hold the corresponding metadata, such as:

- Owner and document association.
- Object key.
- File size and media type.
- Processing status.
- Creation and retention timestamps.

The application must enforce the established 4 MB per-file limit and validate allowed file types. Private files must be protected by authorization checks and suitable object-access policies.

The specific storage provider, bucket configuration, encryption, lifecycle policies, and recovery strategy remain to be decided.

## 7. Redis

**Decision:** Use Redis for application caching and refresh-token/session state.

Cache and session workloads will use separate Redis instances or managed deployments to prevent cache eviction policies from affecting security-critical session state.

### Cache responsibilities

- Store eligible, rebuildable application data.
- Use an eviction policy selected and validated against the actual workload.
- Treat cached values as non-authoritative copies.

### Session responsibilities

- Track refresh-token/session validity and revocation.
- Apply explicit expiration.
- Ensure session state is validated before issuing refreshed credentials.
- Fail closed when session validity cannot be established.

The session-store eviction policy will be `noeviction`. Persistence, replication, and recovery settings will be defined in the operational design.

## 8. AI Integration

**Decision:** Integrate the selected external LLM provider through the backend.

The frontend must not contain privileged AI-provider API keys.

The backend AI integration should isolate provider-specific calls behind a defined interface and handle timeouts, validation, errors, rate limits, and retries according to the later API and architecture designs.

The exact provider, model, token limits, timeout policy, retry policy, and cost controls remain open decisions.

## 9. Testing and Delivery

### 9.1 Automated testing

The project will include unit and integration tests. The exact test runner and supporting libraries will be selected during development tooling setup.

Testing should cover business logic, API validation, authorization, persistence, document processing, and AI integration boundaries.

### 9.2 CI/CD

The delivery pipeline should automate applicable checks, including:

- Dependency installation from the lockfile.
- Static type checking.
- Linting and automated tests.
- Build verification.
- Database migration validation.
- Deployment steps appropriate to the chosen hosting providers.

The CI provider, hosting targets, deployment strategy, and production release controls will be defined later.

## 10. Alternatives Considered

| Decision                 | Selected choice                      | Alternatives or details                                 |
| ------------------------ | ------------------------------------ | ------------------------------------------------------- |
| Frontend framework       | React                                | Other frameworks were not formally benchmarked          |
| Client state             | Redux Toolkit                        | Exact server-state strategy remains open                |
| Backend runtime          | Node.js                              | Runtime is selected independently of package management |
| Package manager          | pnpm                                 | npm and Bun were considered                             |
| HTTP framework           | Express                              | No formal framework benchmark is claimed                |
| Relational database      | PostgreSQL                           | Hosting and instance selection remain open              |
| ORM                      | Drizzle ORM                          | Migration conventions remain to be defined              |
| Vector search            | pgvector                             | Embedding and index choices remain open                 |
| Conversation persistence | PostgreSQL                           | Relational tables and JSONB where justified             |
| Object storage           | S3-compatible storage                | Specific provider remains open                          |
| Cache/session store      | Redis                                | Deployment and recovery configuration remain open       |
| AI provider              | External LLM API                     | Provider and model remain open                          |
| Testing                  | Automated unit and integration tests | Exact tooling remains open                              |

No benchmark results are claimed for the alternatives.

## 11. Consequences and Trade-offs

### Benefits

- A TypeScript-centered application stack.
- Clear separation between application logic, relational data, vector retrieval, object storage, and runtime cache/session state.
- PostgreSQL provides relational integrity for core product data.
- Conversation history and long-term context can be managed without introducing another database.
- pnpm provides reproducible dependency installation.
- Object storage keeps large file content outside relational database rows.

### Trade-offs

- PostgreSQL must be designed to support both relational workloads and conversation persistence.
- Vector search requires embedding lifecycle management and index tuning.
- Redis session state requires careful expiration, revocation, and recovery design.
- AI generation depends on external provider behavior and limits.
- S3-compatible storage requires explicit access controls and retention policies.

These trade-offs are accepted for the selected baseline and will be addressed in the detailed designs.

## 12. Decision Status and Next Steps

The technology baseline is selected.

The following work remains intentionally separate:

1. **API design:** define endpoints, request and response contracts, validation, authentication, authorization, pagination, error handling, and AI workflow behavior.
2. **Database schema design:** define entities, columns, relationships, constraints, indexes, and migrations using the agreed API requirements.
3. **Architecture design:** define module boundaries, interactions, request flows, security controls, deployment, and failure handling.

The database schema must not be finalized before API design, because the API contracts and business operations determine the data relationships and query patterns the schema must support.

**End of technology selection document**
