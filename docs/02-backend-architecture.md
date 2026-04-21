# 2. Backend Architecture

## Technology

- FastAPI
- SQLAlchemy ORM
- Pydantic schema validation
- JWT (python-jose)
- Password hashing (passlib)

## Backend Folder Structure

```text
backend/
  app/
    auth/
      deps.py
      security.py
    models/
      base.py
      user.py
      doctor.py
      patient.py
      appointment.py
    routes/
      auth.py
      patients.py
      doctors.py
      appointments.py
      dashboard.py
    schemas/
      auth.py
      user.py
      doctor.py
      patient.py
      appointment.py
      dashboard.py
    utils/
      seed.py
    config.py
    database.py
    main.py
  seed_data.py
  requirements.txt
  Dockerfile
```

## Layer Responsibilities

1. `main.py`
- FastAPI app setup
- Middleware registration (CORS)
- Route registration
- DB table bootstrap on startup

2. `config.py`
- Environment variable loading
- Shared runtime settings object

3. `database.py`
- SQLAlchemy engine initialization
- Session factory creation (`SessionLocal`)
- Request-scoped DB session dependency (`get_db`)

4. `models/`
- ORM entities and relationships
- Enum types for role/status constraints

5. `schemas/`
- Request and response contract definitions
- Input validation constraints

6. `routes/`
- REST endpoint definitions
- Route-level role restrictions
- Business logic coordination with ORM

7. `auth/`
- Password hashing and token creation
- Current-user extraction and role checks

## Error Handling Pattern

- Uses `HTTPException` with appropriate status codes
- Common cases:
  - `400`: validation/business rule conflict (e.g., duplicate email)
  - `401`: invalid credentials or token
  - `403`: insufficient permissions
  - `404`: missing entity

## Startup Behavior

On startup, backend executes table creation:
- `Base.metadata.create_all(bind=engine)`

This simplifies local onboarding and demo setup.

## Scalability Notes

Current architecture supports straightforward scaling by:
- Splitting route handlers into service layer functions if logic grows
- Introducing migrations (Alembic) for production schema evolution
- Adding repository abstraction for complex query composition
- Adding structured logging + observability middlewares
