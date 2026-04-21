# Medical Automation System

Production-ready full-stack Medical Automation System with authentication, role-based access, dashboards, and deployment support.

## Stack
- Frontend: React (Vite), Tailwind CSS, Axios, React Router
- Backend: FastAPI, SQLAlchemy ORM, PostgreSQL (SQLite fallback)
- Auth: JWT + bcrypt password hashing
- Deployment: Docker (backend), Vercel (frontend)

## Project Structure

```txt
backend/
  app/
    auth/
    models/
    routes/
    schemas/
    utils/
    config.py
    database.py
    main.py
  Dockerfile
  requirements.txt
  .env.example
  seed_data.py
frontend/
  src/
    components/
    context/
    hooks/
    layouts/
    pages/
    services/
  package.json
  .env.example
docker-compose.yml
database_schema.sql
```

## Features

### Authentication
- Register: `/auth/register` (admin or doctor)
- Login: `/auth/login`
- JWT token issued on auth and used for protected APIs
- Password hashing with bcrypt

### RBAC
- Admin: manage patients, doctors, all appointments
- Doctor: view own appointments, update status, add notes/prescriptions

### Modules
- Patients: add, list, delete (admin)
- Doctors: add, list (admin creates doctor accounts)
- Appointments: create, list (role-aware), update status/notes
- Dashboard: totals + completed vs pending stats

### Bonus included
- Patient search
- Loading states
- Toast notifications
- Dashboard status chart

## Backend Setup (Local)

1. Create env file:
```powershell
Copy-Item backend/.env.example backend/.env
```

2. Install dependencies:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

3. Run API:
```powershell
uvicorn app.main:app --reload
```

4. Seed sample users:
```powershell
python seed_data.py
```

## Frontend Setup (Local)

1. Create env file:
```powershell
Copy-Item frontend/.env.example frontend/.env
```

2. Install and run:
```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

## Docker (Backend + Frontend dev)

```powershell
docker compose up --build
```

## API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Patients
- `POST /patients`
- `GET /patients`
- `DELETE /patients/{id}`

### Doctors
- `POST /doctors`
- `GET /doctors`

### Appointments
- `POST /appointments`
- `GET /appointments`
- `PUT /appointments/{id}`

### Dashboard
- `GET /dashboard/stats`

## Deployment

### Backend on Render
1. Push repo to GitHub.
2. Create new Web Service in Render.
3. Root directory: `backend`.
4. Build command: `pip install -r requirements.txt`.
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add env vars:
   - `SECRET_KEY`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`
   - `ALGORITHM`
   - `DATABASE_URL` (PostgreSQL URL)
   - `CORS_ORIGINS` (frontend URL)

### Frontend on Vercel
1. Import GitHub repo in Vercel.
2. Root directory: `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add env var: `VITE_API_URL=<your-backend-url>`.

## Sample Test Users

After running `python backend/seed_data.py`:
- Admin:
  - Email: `admin@medauto.com`
  - Password: `Admin@123`
- Doctor:
  - Email: `doctor@medauto.com`
  - Password: `Doctor@123`

## Notes
- SQLite is default for local development.
- Set `DATABASE_URL` to PostgreSQL in production.
- CORS is configurable via `.env`.
