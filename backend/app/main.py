from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.db_migrations import run_startup_migrations
from app.database import SessionLocal, engine
from app.models.base import Base
from app.routes import appointments, auth, consultations, dashboard, doctors, medicines, patients
from app.utils.seed import seed_default_medicines

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    run_startup_migrations()
    with SessionLocal() as session:
        seed_default_medicines(session)


@app.get("/")
def healthcheck():
    return {"message": "Medical Automation API is running"}


app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(medicines.router)
app.include_router(consultations.router)
app.include_router(appointments.router)
app.include_router(dashboard.router)
