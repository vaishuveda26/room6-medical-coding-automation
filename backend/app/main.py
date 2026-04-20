from fastapi import APIRouter, FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.v1.router import router as v1_router
from app.core.database import Base, engine
from app.core.config import settings

app = FastAPI(title=settings.app_name, version="1.0.0")

api_router = APIRouter(prefix="/api")
api_router.include_router(v1_router, prefix="/v1")


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@api_router.get("/health")
def api_health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Request validation failed"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc), "message": "Unexpected server error"},
    )