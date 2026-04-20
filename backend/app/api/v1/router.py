from fastapi import APIRouter

from app.api.v1.endpoints import coding

router = APIRouter()
router.include_router(coding.router, prefix="/coding", tags=["coding"])
