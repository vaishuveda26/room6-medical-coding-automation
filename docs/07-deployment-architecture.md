# 7. Deployment Architecture

## Backend Deployment (Render/Railway)

### Build/runtime

- Containerized via `backend/Dockerfile`
- Runs `uvicorn app.main:app`

### Required environment variables

- `APP_NAME`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `ALGORITHM`
- `DATABASE_URL` (PostgreSQL URL in production)
- `CORS_ORIGINS` (frontend domain)

### Production topology

- Managed web service (FastAPI)
- Managed PostgreSQL instance
- Public HTTPS endpoint consumed by frontend

## Frontend Deployment (Vercel/Netlify)

### Build/runtime

- Vite build command: `npm run build`
- Output: `dist/`

### Required environment variable

- `VITE_API_URL` pointing to deployed backend API

## CORS Integration

- Backend must allow deployed frontend domain via `CORS_ORIGINS`
- Use explicit origins, not wildcard, in production

## CI/CD Suggestion

- Push to `private`/main branch triggers platform deployment
- Add lint/test steps before deployment gates

## Docker Compose (Local Convenience)

Root-level `docker-compose.yml` enables local backend+frontend developer startup.

## Recommended Production Hardening

- Add DB migrations (Alembic)
- Add health checks and uptime monitoring
- Add structured request logs and error tracking
- Add secret management via platform vault
