# Backend Design Blueprint

## Purpose
Build a reliable medical coding automation backend that ingests clinical context, produces coding suggestions, and tracks review workflow outcomes.

## Architectural Style
- API layer: FastAPI routes and transport concerns.
- Service layer: business workflows (coding suggestion lifecycle, validation, orchestration).
- Repository layer: persistence abstraction (in-memory now, DB later).
- Schema layer: request/response contracts via Pydantic.
- Model layer: domain entities and internal state objects.

## Core Domains
- Patient context: demographics and identifiers.
- Encounter context: visit metadata, provider, specialty, note metadata.
- Coding workflow: suggestion generation, confidence scoring, review state, audit events.

## API Contracts (v1)
- `GET /api/health`: liveness status.
- `GET /api/v1/coding/status`: coding engine readiness.
- `POST /api/v1/coding/suggestions`: returns ranked code suggestions for note text.
- `POST /api/v1/coding/jobs`: creates an async-style coding job record.
- `GET /api/v1/coding/jobs/{job_id}`: fetches job state and result.

## Workflow
1. Client submits note text and encounter context.
2. Service validates input and performs rule/ML orchestration (placeholder now).
3. Suggestions are produced with confidence metadata.
4. Optional job record is persisted for traceability.
5. Reviewer UI consumes result and records accept/reject actions (future endpoint).

## Data Model Snapshot
- CodingSuggestion: code, description, confidence, rationale.
- CodingRequest: note text + optional context.
- CodingResponse: ranked suggestions + generated timestamp.
- CodingJob: id, status, timestamps, request hash, optional result payload.

## Non-Functional Requirements
- Auditability: include timestamps and deterministic IDs.
- Privacy: no PHI in logs by default.
- Extensibility: repository abstraction for PostgreSQL migration.
- Testability: service logic isolated from FastAPI routing.

## Next Build Milestones
1. Add persistent storage with SQLAlchemy + Alembic.
2. Add authn/authz for protected coding operations.
3. Integrate terminology sources (ICD/CPT dictionaries).
4. Add reviewer decision endpoints and audit trails.
5. Add async task queue for heavy inference workloads.
