# 5. API Reference

Base URL (local): `http://localhost:8000`

## Auth

### `POST /auth/register`

Registers a user as `admin` or `doctor`.

Request:
```json
{
  "name": "System Admin",
  "email": "admin@medauto.com",
  "password": "Admin@123",
  "role": "admin",
  "specialization": null
}
```

Response:
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "role": "admin",
  "name": "System Admin"
}
```

### `POST /auth/login`

Authenticates user credentials.

Request:
```json
{
  "email": "admin@medauto.com",
  "password": "Admin@123"
}
```

Response: same token shape as register.

## Patients (Admin)

### `POST /patients`

Creates patient.

### `GET /patients?search=<name>`

Lists patients. Optional `search` filter by partial name.

### `DELETE /patients/{id}`

Deletes patient by ID.

## Doctors

### `POST /doctors` (Admin)

Creates doctor user + doctor profile.

### `GET /doctors` (Admin/Doctor)

Lists doctors.

## Appointments

### `POST /appointments` (Admin)

Books appointment with patient, doctor, date.

### `GET /appointments` (Admin/Doctor)

- Admin receives all appointments
- Doctor receives only appointments assigned to their profile

### `PUT /appointments/{id}` (Admin/Doctor)

Updates status and/or notes.
- Doctor can only update own appointments.

## Dashboard

### `GET /dashboard/stats` (Admin/Doctor)

Returns aggregate counters:
- total patients
- total doctors
- total appointments
- pending appointments
- completed appointments

## Auth Header Format

```http
Authorization: Bearer <token>
```
