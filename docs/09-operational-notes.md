# 9. Operational Notes

## Monitoring and Logging (Current State)

- Basic FastAPI runtime logs via Uvicorn
- No centralized logging stack configured by default

## Backup and Recovery

- SQLite local file backups can be done at file level
- PostgreSQL backup should use platform-native snapshots/dumps

## Data Governance Notes

- Current model is demo-oriented and does not include:
  - PHI encryption at rest controls beyond DB defaults
  - audit trail for every mutation
  - advanced consent/access auditing

For production healthcare compliance, add security controls aligned with relevant regulations.

## Suggested Next Improvements

1. Introduce Alembic migrations
2. Add automated tests (unit + integration)
3. Add API versioning strategy
4. Add standardized response envelope and error codes
5. Add audit logs for appointment updates
6. Add pagination/sorting for large datasets
7. Add refresh tokens and token revocation strategy
