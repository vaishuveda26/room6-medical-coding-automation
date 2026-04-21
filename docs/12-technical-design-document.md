# 12. Technical Design Document

## 1. Architecture Summary

### Frontend
- Framework: React with Vite
- Routing: React Router
- Styling: Tailwind CSS
- API communication: Axios
- State: local component state + auth context

### Backend
- Framework: FastAPI
- ORM: SQLAlchemy
- Authentication: JWT with hashed passwords
- Validation: Pydantic schemas

### Database
- Local default: SQLite
- Production-ready target: PostgreSQL

## 2. Backend Technical Structure

### Package Layout
- `app/models`: ORM entities
- `app/schemas`: request/response contracts
- `app/routes`: feature APIs
- `app/auth`: login, token, access control
- `app/utils`: seed logic and helpers

### Core Models
- `User`
- `Patient`
- `Doctor`
- `Appointment`
- `Medicine`

### Important Design Behaviors
- tables are created on startup
- startup migrations add missing columns for existing local databases
- default medicines are seeded automatically
- role checks are applied through dependencies

## 3. Frontend Technical Structure

### Page Modules
- `DashboardPage`
- `PatientsPage`
- `DoctorsPage`
- `MedicinesPage`
- `AppointmentsPage`
- `LoginPage`
- `RegisterPage`

### Shared Concerns
- auth token attachment through Axios interceptor
- route protection through `ProtectedRoute`
- app shell through `AppLayout`
- consistent styling through shared CSS utility classes

## 4. API Design Notes

### Authentication
- `POST /auth/register`
- `POST /auth/login`

### Patients
- `POST /patients`
- `GET /patients`
- `PUT /patients/{id}`
- `DELETE /patients/{id}`

### Doctors
- `POST /doctors`
- `GET /doctors`
- `PUT /doctors/{id}`

### Medicines
- `POST /medicines`
- `GET /medicines`
- `PUT /medicines/{id}`
- `DELETE /medicines/{id}`

### Appointments
- `POST /appointments`
- `GET /appointments`
- `PUT /appointments/{id}`

### Dashboard
- `GET /dashboard/stats`

## 5. Validation Rules

### Patient
- valid gender
- age range
- phone length

### Doctor
- valid gender
- valid email
- password length
- specialization and profile field minimum lengths

### Appointment
- future date only
- no overlapping doctor slot
- patient and doctor must exist

### Medicine
- unique code
- required name and symptom mapping

## 6. Security and Access

### Admin
- full patient control
- full doctor control
- medicine CRUD
- appointment booking and administrative updates

### Doctor
- dashboard access
- appointment access limited to their schedule
- medicine search/list access

## 7. Known Technical Considerations
- SQLite schema evolution is being handled with lightweight startup migration logic rather than a formal migration framework
- frontend currently uses page-level component composition rather than a deep reusable component library
- backend tests are not yet fully implemented in code, but unit test cases are documented
