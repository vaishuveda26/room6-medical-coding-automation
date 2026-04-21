# 11. Functional Flow Document

## 1. End-to-End Functional Journey

### 1.1 Login Flow
1. User opens login page.
2. User enters email and password.
3. Frontend calls `POST /auth/login`.
4. Backend validates credentials.
5. JWT token and user role are returned.
6. User is redirected to dashboard.

### 1.2 Patient Management Flow
1. Admin opens Patients module.
2. Existing patients are loaded automatically.
3. Admin types in search box and list auto-filters.
4. Admin creates or edits patient details.
5. Frontend calls patient create or update API.
6. Backend validates payload and saves record.
7. UI refreshes patient list.

### 1.3 Doctor Management Flow
1. Admin opens Doctors module.
2. Doctor list loads.
3. Admin searches doctor records in-page.
4. Admin creates or updates doctor details.
5. Backend updates doctor profile and linked user details.
6. Updated list is shown in UI.

### 1.4 Medicine Management Flow
1. User opens Medicines module.
2. Medicine list loads automatically.
3. User searches by symptom, name, code, or description.
4. Admin creates or updates medicine records.
5. Backend persists changes and returns updated entity.
6. UI refreshes result list.

### 1.5 Appointment Booking Flow
1. Admin opens Appointments module.
2. Patient and doctor lists load for booking.
3. Admin enters appointment details.
4. Frontend submits booking request.
5. Backend checks:
   - patient exists
   - doctor exists
   - appointment is in the future
   - doctor slot does not overlap
6. Backend creates appointment and appointment code.
7. UI refreshes appointment list.

### 1.6 Appointment Update Flow
1. User opens appointment row update form.
2. User changes allowed fields.
3. Frontend calls `PUT /appointments/{id}`.
4. Backend validates role and update rules.
5. Backend saves changes.
6. UI refreshes appointment list.

### 1.7 Dashboard Flow
1. User opens dashboard.
2. Frontend calls `/dashboard/stats`.
3. Backend returns:
   - totals
   - recent items
   - today appointments
   - tomorrow appointments
   - filtered queue
4. User clicks module cards to navigate to target list pages.

## 2. Module-Level Flow Summary

### Patients
- Search
- Add
- Edit
- Delete

### Doctors
- Search
- Add
- Edit

### Medicines
- Search
- Add
- Edit
- Delete

### Appointments
- Search
- Filter by status
- Add
- Update
- View operational queue

### Dashboard
- See module counts
- Navigate to modules
- Review appointment outlook
- Review recent entries
