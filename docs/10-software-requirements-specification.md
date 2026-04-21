# 10. Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification defines the functional and non-functional requirements for the Medical Automation System. It is intended for stakeholders, product owners, developers, testers, and support teams.

### 1.2 Scope
The system is a web-based operational platform for managing:
- user authentication and role-based access
- patient records
- doctor profiles
- appointment scheduling and updates
- medicine master data with symptom-based search
- dashboard-driven operational visibility

### 1.3 Intended Users
- Admin users
- Doctor users
- QA and support teams
- Technical implementation teams

## 2. Product Overview

### 2.1 Product Perspective
The platform is a full-stack application with:
- React frontend
- FastAPI backend
- SQLAlchemy ORM
- SQLite for local development and PostgreSQL-ready deployment support

### 2.2 Product Objectives
- reduce manual tracking for healthcare operations
- centralize master data for patients, doctors, medicines, and appointments
- provide a consistent operational dashboard
- enforce role-based access and data security

## 3. Functional Requirements

### 3.1 Authentication and Access Control
- The system shall allow users to register as `admin` or `doctor`.
- The system shall allow registered users to log in using email and password.
- The system shall issue JWT tokens on successful authentication.
- The system shall restrict screen and API access based on user role.

### 3.2 Patient Management
- Admin shall be able to create patient records.
- Admin shall be able to search patients by keyword.
- Admin shall be able to edit patient profile details.
- Admin shall be able to delete patient records.
- Patient records shall include standard fields such as:
  - name
  - age
  - gender
  - phone
  - email
  - address
  - blood group
  - emergency contact details

### 3.3 Doctor Management
- Admin shall be able to create doctor records and associated user accounts.
- Admin shall be able to edit doctor profile details.
- Admin shall be able to search doctor records in the UI.
- Doctor records shall include standard fields such as:
  - name
  - email
  - specialization
  - gender
  - phone
  - address
  - qualification
  - license number
  - years of experience

### 3.4 Appointment Management
- Admin shall be able to create appointments.
- Appointments shall include:
  - appointment code
  - patient
  - doctor
  - appointment date and time
  - status
  - consultation mode
  - priority
  - duration
  - reason for visit
  - symptoms
  - notes
- The system shall reject appointments created in the past.
- The system shall reject overlapping appointment slots for the same doctor.
- Admin shall be able to reschedule and update appointments.
- Doctors shall be able to update their own appointments, subject to role restrictions.

### 3.5 Medicine Management
- Admin shall be able to create medicine master records.
- Admin shall be able to update medicine records.
- Admin shall be able to delete medicine records.
- Admin and doctors shall be able to search medicines by:
  - code
  - name
  - symptoms
  - description
- The system shall provide default seeded medicine records.

### 3.6 Dashboard
- The system shall display high-level counts for patients, doctors, medicines, and appointments.
- The dashboard shall provide clickable metric cards that navigate to module lists.
- The dashboard shall highlight today’s appointments.
- The dashboard shall support alternate views for tomorrow and extended appointment queues.
- The dashboard shall allow appointment status filtering.

## 4. Non-Functional Requirements

### 4.1 Usability
- The interface shall be responsive for desktop and standard laptop screens.
- Search shall update automatically on user keypress without requiring separate search buttons.
- UI modules shall follow a consistent company-standard visual style.

### 4.2 Performance
- Standard list operations should complete within acceptable internal operational limits under small-to-medium data volume.
- Search and dashboard filters should update quickly for routine operational use.

### 4.3 Security
- Passwords shall be stored as hashes.
- JWT shall be required for protected APIs.
- Role-based authorization shall be enforced at API level.

### 4.4 Maintainability
- Backend shall follow modular route/model/schema separation.
- Frontend shall use page-level module separation.
- Documentation shall be stored under the `docs/` directory.

## 5. External Interface Requirements

### 5.1 User Interface
- Web browser based UI
- role-aware navigation
- modal-based create/update forms
- searchable module tables
- operational dashboard

### 5.2 API Interface
- RESTful HTTP endpoints
- JSON request and response format

### 5.3 Database Interface
- SQL-backed persistence through SQLAlchemy
- schema includes users, patients, doctors, appointments, medicines

## 6. Constraints
- Local development is based on SQLite defaults.
- Production deployment requires secure environment variables.
- Current implementation supports two user roles only:
  - admin
  - doctor

## 7. Assumptions
- Operational users have secure authenticated access.
- Admin users are responsible for data stewardship and master record maintenance.
- Appointment times are managed according to backend validation rules and local browser input.
