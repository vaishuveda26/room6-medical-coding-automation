# 1. System Overview

## Purpose

The Medical Automation System is a role-aware healthcare operations platform that helps an Admin manage core entities (patients, doctors, appointments) and allows Doctors to execute appointment workflows (status updates, notes/prescriptions).

## High-Level Architecture

- Client-server web application
- SPA frontend consumes REST backend APIs
- JWT-based stateless authentication
- SQL database persistence via ORM layer

## Component Map

- Frontend (`frontend/`)
  - React SPA
  - Route guarding and role-aware rendering
  - Axios API client with auth interceptor
- Backend (`backend/`)
  - FastAPI REST service
  - SQLAlchemy ORM and session management
  - Security/auth and RBAC dependencies
- Database
  - Entity tables for users, doctors, patients, appointments

## Architectural Principles Used

- Clean separation of concerns:
  - routing layer
  - schema/validation layer
  - persistence model layer
  - auth/security layer
- Lightweight but scalable structure
- Shared role definitions between API behavior and UI behavior
- Explicit environment configuration

## Main Runtime Flows

1. Authentication flow
- User registers or logs in
- Backend validates credentials and returns JWT
- Frontend stores token in `localStorage`
- Subsequent requests use `Authorization: Bearer <token>`

2. Admin operations flow
- Admin accesses patients/doctors/appointments pages
- Frontend calls protected admin endpoints
- Backend authorizes using role dependency

3. Doctor operations flow
- Doctor logs in
- Doctor sees only their own appointments
- Doctor updates appointment status and notes

## Non-Functional Characteristics

- Maintainable folder structure
- Quick local startup
- Deployment-ready for common hosting providers
- Easy to extend with additional modules (billing, audit logs, etc.)
