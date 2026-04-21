# 8. Local Development Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm

## Backend Setup

```powershell
cd backend
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload
```

## Frontend Setup

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

## URLs

- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173`

## Seeded Credentials

- Admin: `admin@medauto.com` / `Admin@123`
- Doctor: `doctor@medauto.com` / `Doctor@123`

## Common Troubleshooting

1. Auth/hash related package mismatch
- Reinstall dependencies inside fresh venv
- Ensure backend starts and `seed_data.py` executes

2. CORS issue
- Confirm frontend URL is included in backend `CORS_ORIGINS`

3. Empty doctor appointments
- Verify doctor profile exists in `doctors` table linked by `user_id`

4. 401/403 responses
- Check JWT exists and is attached in request header
- Check current user role for endpoint restrictions
