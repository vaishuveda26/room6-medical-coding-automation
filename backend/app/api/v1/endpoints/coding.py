from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.core.container import get_coding_service
from app.schemas.coding import CodingJobDetailResponse, CodingJobSummary, FinalizeCodesRequest, TextSuggestionRequest
from app.services.coding_service import CodingService
from app.services.file_parser import NoteFileParser

router = APIRouter()
file_parser = NoteFileParser()


@router.get("/status")
def coding_status() -> dict[str, str]:
    return {"message": "Medical coding automation service is running"}


@router.post("/suggestions/text", response_model=CodingJobDetailResponse, status_code=status.HTTP_201_CREATED)
def create_job_from_text(
    payload: TextSuggestionRequest,
    coding_service: CodingService = Depends(get_coding_service),
) -> CodingJobDetailResponse:
    return coding_service.create_suggestions_job(note_text=payload.note_text, source_type="text")


@router.post("/suggestions/file", response_model=CodingJobDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_job_from_file(
    note_file: UploadFile = File(...),
    coding_service: CodingService = Depends(get_coding_service),
) -> CodingJobDetailResponse:
    note_text = await file_parser.parse_upload(note_file)
    if len(note_text) < 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Note content is too short.")
    return coding_service.create_suggestions_job(note_text=note_text, source_type="file")


@router.post("/jobs", response_model=CodingJobDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_job_unified(
    note_text: str | None = Form(default=None),
    note_file: UploadFile | None = File(default=None),
    coding_service: CodingService = Depends(get_coding_service),
) -> CodingJobDetailResponse:
    has_text = bool(note_text and note_text.strip())
    has_file = note_file is not None

    if has_text and has_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either note_text or note_file, not both.",
        )
    if not has_text and not has_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One of note_text or note_file is required.",
        )

    if has_text:
        payload = TextSuggestionRequest(note_text=note_text or "")
        return coding_service.create_suggestions_job(note_text=payload.note_text, source_type="text")

    parsed = await file_parser.parse_upload(note_file)
    payload = TextSuggestionRequest(note_text=parsed)
    return coding_service.create_suggestions_job(note_text=payload.note_text, source_type="file")


@router.get("/jobs", response_model=list[CodingJobSummary])
def list_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    coding_service: CodingService = Depends(get_coding_service),
) -> list[CodingJobSummary]:
    return coding_service.list_jobs(limit=limit, offset=offset)


@router.get("/jobs/{job_id}", response_model=CodingJobDetailResponse)
def get_coding_job(job_id: int, coding_service: CodingService = Depends(get_coding_service)) -> CodingJobDetailResponse:
    job = coding_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.put("/jobs/{job_id}/finalize", response_model=CodingJobDetailResponse)
def finalize_codes(
    job_id: int,
    payload: FinalizeCodesRequest,
    coding_service: CodingService = Depends(get_coding_service),
) -> CodingJobDetailResponse:
    updated = coding_service.finalize_job(job_id=job_id, finalized_codes=payload.finalized_codes)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return updated