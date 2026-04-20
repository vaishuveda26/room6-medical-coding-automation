from fastapi import FastAPI
from fastapi import APIRouter

from app.api.v1.router import router as v1_router

app = FastAPI(title="Medical Automation API", version="0.1.0")

api_router = APIRouter(prefix="/api")
api_router.include_router(v1_router, prefix="/v1")


@api_router.get("/health")
def api_health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
