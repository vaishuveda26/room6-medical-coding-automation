from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
def coding_status() -> dict[str, str]:
    return {"message": "Coding automation endpoint ready"}
