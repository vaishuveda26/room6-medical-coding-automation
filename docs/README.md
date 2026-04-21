# Medical Automation System Documentation

This folder contains complete technical documentation for the Medical Automation System.

## Docs Index

1. [System Overview](./01-system-overview.md)
2. [Backend Architecture](./02-backend-architecture.md)
3. [Frontend Architecture](./03-frontend-architecture.md)
4. [Database Architecture](./04-database-architecture.md)
5. [API Reference](./05-api-reference.md)
6. [Authentication and RBAC](./06-auth-and-rbac.md)
7. [Deployment Architecture](./07-deployment-architecture.md)
8. [Local Development Guide](./08-local-development-guide.md)
9. [Operational Notes](./09-operational-notes.md)

## Project Snapshot

- Frontend: React + Vite + Tailwind + Axios + React Router
- Backend: FastAPI + SQLAlchemy
- Database: SQLite (local fallback), PostgreSQL (production-ready)
- Security: JWT auth, password hashing, RBAC
- Roles: `admin`, `doctor`

## Core Functional Scope

- User registration and login
- Role-based data access and role-based UI
- Patient management (admin)
- Doctor management (admin)
- Appointment booking + updates
- Dashboard analytics

## Notes

- Tables are auto-created on backend startup.
- Seed script is available for sample users (`backend/seed_data.py`).
- API docs are available at `/docs` when backend is running.
