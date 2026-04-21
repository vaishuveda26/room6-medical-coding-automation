# 16. Consolidated Project Prompts

## Purpose
This document consolidates the major prompt-style requirements, enhancement requests, and implementation directions used to shape the current Medical Automation System. It is intended as a single reference for future enhancement, audit, handoff, or reproduction of the delivered functionality.

## 1. Foundation Prompt

### Core Product Prompt
Create a production-ready full-stack Medical Automation System with:
- authentication
- role-based access
- patient management
- doctor management
- appointment scheduling
- dashboard visibility
- deployment-ready structure

### Technology Prompt
Use:
- React with Vite for frontend
- Tailwind CSS for styling
- FastAPI for backend
- SQLAlchemy ORM for persistence
- JWT-based authentication
- SQLite for local fallback
- PostgreSQL-ready structure for deployment

## 2. Authentication and RBAC Prompts

### Authentication Prompt
Implement:
- login
- registration
- JWT token generation
- protected routes
- password hashing

### RBAC Prompt
Use two roles:
- `admin`
- `doctor`

Role expectations:
- Admin can manage patients, doctors, medicines, and appointments
- Doctor can view and update their own appointments and access dashboard and medicine search

## 3. Patient Module Prompts

### Original Patient Module Prompt
Create patient module with:
- add patient
- list patient
- search patient
- delete patient

### Enhancement Prompt
Do enhancement in Patient module in front and backend:
- gender in dropdown
- address
- other standard fields

### Implemented Patient Standard Fields
- name
- age
- gender
- phone
- email
- address
- blood group
- emergency contact name
- emergency contact phone

### UX Prompt for Patients
- Search should be there on page
- Search should work automatically on keypress
- Do not require a search button
- Add/update/edit/delete should be accessible from the list page

## 4. Doctor Module Prompts

### Original Doctor Module Prompt
Create doctor module with:
- add doctor
- list doctor

### Enhancement Prompt
Do enhancement in Doctor module in front and backend:
- gender in dropdown
- address
- other standard fields

### Implemented Doctor Standard Fields
- name
- email
- password
- specialization
- gender
- phone
- address
- qualification
- license number
- years of experience

### UX Prompt for Doctors
- Search should be there on page
- Search should work automatically on keypress
- Do not require a search button
- Add/update/edit should be supported from UI

## 5. Medicine Module Prompts

### Medicine Master Prompt
Add new module:
- Medicine along with codes so anyone can find the medicine based on symptoms
- Do some default medicine entry which can be utilized in other modules
- Make CRUD operation for medicine module

### Implemented Medicine Fields
- code
- name
- symptoms
- dosage
- description

### Search Prompt for Medicines
- Search by symptoms
- Search automatically while typing
- No search button

## 6. Appointment Module Prompts

### Base Appointment Prompt
Create appointment booking and update flow.

### Validation Prompt
Please put proper validation for:
- Date should be more than current time

### Company Standard Booking Prompt
Booking appointment should be company standard. Please make changes.

### Implemented Booking Standard Fields
- appointment code
- patient
- doctor
- appointment date/time
- status
- consultation mode
- priority
- duration
- reason for visit
- symptoms
- notes

### Booking Rules Prompt
Ensure:
- appointment date must be future date
- overlapping appointment slot for same doctor should not be allowed

### Appointment Search/Filter Prompt
- search should exist on page
- search should work on keypress
- filters should auto-apply
- no filter/search button required

## 7. Dashboard Prompts

### Enhancement Prompt
Dashboard should be enhanced in such a way that any new entry comes up that can be visualized.

### Scheduling Prompt
Today and tomorrow appointment should be displayed and filter should be extendable.

### Standard Dashboard Prompt
Dashboard should be standard:
- Number of patients should be shown
- Clicking patient count should move to patient list
- Same for all modules
- Should highlight today’s appointments
- View should be extendable with tomorrow and so on

### Styling Prompt
Please change layout for dashboard as it seems old CSS used.

### Highlight Reduction Prompt
Appointments section:
- reduce excessive highlighting
- make summary quieter and cleaner

### Implemented Dashboard Behavior
- clickable count cards
- today, tomorrow, extended appointment view
- status filter
- recent records
- operational summary

## 8. Search Experience Prompts

### Unified Search Prompt
On every page:
- search should be there
- it should work on keypress
- no search button should be required

### Applied Search Behavior
- Patients: API search with debounce
- Doctors: local typed filtering
- Medicines: API search with debounce
- Appointments: API search/filter with debounce
- Dashboard: auto-refresh on filter changes

## 9. CRUD/Update Verification Prompts

### Validation Prompt
Add/update functionality not working for:
- Patient
- Doctor
- Medicine
- Appointment

Please verify all.

### Implemented CRUD Outcomes
- Patient: create, list, update, delete
- Doctor: create, list, update
- Medicine: create, list, update, delete
- Appointment: create, list, update

## 10. UI/Design Prompts

### Company Standard UI Prompt
Please create a company standard look and feel for all the modules.

### Layout/Design Direction Applied
- consistent branded shell
- modern auth experience
- improved page headers
- unified toolbar and table styling
- consistent modal design
- cleaner dashboard
- icon-based row actions

### List Page Action Prompt
Put add, edit, update and delete icon on list page instead of labels.

### Implemented Icon Action Behavior
- add icon on list toolbar
- edit icon on row actions
- update icon on appointment row action
- delete icon on removable row actions

## 11. Documentation Prompts

### Documentation Pack Prompt
Please create:
- SRS
- Functional flow document
- Technical document
- Flow chart
- Sequence diagram
- Unit test cases

### Delivered Documentation
- `10-software-requirements-specification.md`
- `11-functional-flow-document.md`
- `12-technical-design-document.md`
- `13-flowchart.md`
- `14-sequence-diagram.md`
- `15-unit-test-cases.md`

## 12. Operational / Fix Prompts

### Backend/API Fix Themes
Prompts and issues addressed during delivery included:
- unable to run backend setup command
- back-office API errors
- patient list load failures
- doctor create validation failures
- appointment booking validation failures
- dashboard layout inconsistencies

### Fix Themes Implemented
- PowerShell setup correction
- local venv workaround guidance
- schema/data normalization for gender values
- startup migration support for new columns
- timezone-safe appointment validation
- duplicate-safe appointment code generation

## 13. Consolidated Rebuild Prompt

If the system needs to be recreated from scratch using one high-level prompt, the closest consolidated instruction is:

> Build a production-style Medical Automation System using React + Vite + Tailwind on the frontend and FastAPI + SQLAlchemy on the backend. Support admin and doctor roles with JWT authentication and RBAC. Implement patient, doctor, medicine, appointment, and dashboard modules. Add standard operational fields for patient and doctor profiles. Create a medicine master with symptom-based search and seeded defaults. Create company-standard appointment booking with future-date validation, doctor slot conflict checks, scheduling fields, and update workflows. Build a standard dashboard with clickable module cards, today/tomorrow/extended appointment views, recent activity, and live filters. Ensure search exists on every major module page and works automatically on keypress without search buttons. Provide a polished company-standard UI with consistent layout, tables, modals, and icon-based row actions. Also prepare formal documentation including SRS, functional flows, technical design, flowchart, sequence diagrams, and unit test cases.

## 14. Notes

- This document is a reconstruction of the prompt intent used to guide implementation.
- It is meant to preserve requirement direction and implementation context in one place.
- It should be updated when new major feature prompts or business requirements are introduced.
