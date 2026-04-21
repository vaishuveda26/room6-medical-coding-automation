# 4. Database Architecture

## Database Engines

- Local default: SQLite (`sqlite:///./medical_automation.db`)
- Production target: PostgreSQL (`DATABASE_URL`)

## Entity-Relationship Summary

- User (1) -> (0/1) Doctor profile
- Doctor (1) -> (N) Appointments
- Patient (1) -> (N) Appointments
- Appointment links one Patient and one Doctor

## Tables

### `users`

- `id` (PK)
- `name`
- `email` (unique)
- `password_hash`
- `role` (`admin` | `doctor`)
- timestamps

### `doctors`

- `id` (PK)
- `user_id` (FK -> users.id, unique)
- `name`
- `specialization`
- timestamps

### `patients`

- `id` (PK)
- `name`
- `age`
- `gender`
- `phone`
- timestamps

### `appointments`

- `id` (PK)
- `patient_id` (FK -> patients.id)
- `doctor_id` (FK -> doctors.id)
- `date`
- `status` (`pending` | `completed`)
- `notes`
- timestamps

## Referential Behavior

- Deleting a patient cascades to patient appointments
- Deleting doctor/user relationships is constrained by FK rules

## SQL Schema Artifact

- Canonical SQL definition exists in `database_schema.sql`

## Data Integrity Constraints

- unique emails for users
- enum-like constraints for role and appointment status
- non-null constraints on required business fields

## Future Enhancements

- add indices on `appointments(date, doctor_id)`
- add soft-delete strategy for audit compliance
- split notes vs prescription structures if needed
