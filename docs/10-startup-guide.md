# Startup Guide: Frontend, Backend, and Database

## 1. Backend Startup

```powershell
cd C:\Users\2000141879\room6-medical-coding-automation\backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
python seed_data.py
uvicorn app.main:app --reload
```

Backend URLs:
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## 2. Frontend Startup

Open a new terminal:

```powershell
cd C:\Users\2000141879\room6-medical-coding-automation\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Frontend URL:
- App: `http://localhost:5173`

## 3. Database Startup

### Option A: SQLite (default, easiest)

No separate DB server is required.

In `backend/.env`, keep:

```env
DATABASE_URL=sqlite:///./medical_automation.db
```

When backend starts, tables are created automatically. Running `python seed_data.py` inserts sample users.

### Option B: PostgreSQL (local or cloud)

1. Start PostgreSQL (local service or Docker/container).
2. Create a database, for example `medical_automation`.
3. Update `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://<username>:<password>@<host>:5432/medical_automation
```

4. Start backend again:

```powershell
cd C:\Users\2000141879\room6-medical-coding-automation\backend
.\.venv\Scripts\activate
uvicorn app.main:app --reload
python seed_data.py
```

## 4. Quick Login Credentials (after seed)

- Admin: `admin@medauto.com` / `Admin@123`
- Doctor: `doctor@medauto.com` / `Doctor@123`

## 5. One-command Alternative (Docker Compose)

From repo root:

```powershell
cd C:\Users\2000141879\room6-medical-coding-automation
docker compose up --build
```

This starts backend and frontend containers for local development.
