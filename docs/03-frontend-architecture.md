# 3. Frontend Architecture

## Technology

- React (Vite)
- React Router
- Axios
- Tailwind CSS
- Context API for auth/toast state

## Frontend Folder Structure

```text
frontend/
  src/
    components/
      ProtectedRoute.jsx
    context/
      AuthContext.jsx
      ToastContext.jsx
    hooks/
      useAuth.js
      useToast.js
    layouts/
      AppLayout.jsx
    pages/
      LoginPage.jsx
      RegisterPage.jsx
      DashboardPage.jsx
      PatientsPage.jsx
      DoctorsPage.jsx
      AppointmentsPage.jsx
    services/
      api.js
    App.jsx
    main.jsx
```

## Client Architecture Pattern

- Route-centric SPA
- Shared layout for authenticated screens
- Context-based global session management
- Service-based API abstraction via Axios instance

## Key Design Components

1. Authentication context
- Stores token + basic user profile
- Persists auth state in `localStorage`
- Exposes `login()` and `logout()`

2. API client
- Single Axios instance with base URL from env
- Request interceptor attaches bearer token

3. Protected routing
- Guards unauthenticated access
- Supports role filtering for specific pages

4. Global layout
- Sidebar navigation
- Role-aware menu visibility
- Content rendered via `Outlet`

5. Toast notifications
- Lightweight transient notification system
- Success/error feedback for CRUD actions

## Page Responsibilities

- `LoginPage`: authenticate existing users
- `RegisterPage`: create admin/doctor accounts
- `DashboardPage`: aggregate counters + status visualization
- `PatientsPage`: add/list/delete patients and search by name
- `DoctorsPage`: add/list doctors
- `AppointmentsPage`: book/list/update appointments; role-aware behavior

## UI Behavior by Role

Admin:
- full nav (dashboard, patients, doctors, appointments)
- can add patients, doctors, appointments

Doctor:
- dashboard + appointments nav
- can only see own appointments and update status/notes

## Extensibility Notes

Easy additions:
- pagination tables
- reusable modal component abstraction
- richer chart library integration
- role-based route metadata table for centralized access rules
