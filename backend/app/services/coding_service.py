from app.repositories.coding_repository import CodingJobRepository
from app.schemas.coding import CodeFinalizeItem, CodingJobDetailResponse, CodingJobSummary, SuggestionResponse
from app.services.code_mapper import CodeMapper
from app.services.keyword_extractor import KeywordExtractor


class CodingService:
    def __init__(self, repository: CodingJobRepository) -> None:
        self.repository = repository
        self.keyword_extractor = KeywordExtractor()
        self.code_mapper = CodeMapper()

    def create_suggestions_job(self, *, note_text: str, source_type: str) -> CodingJobDetailResponse:
        keywords = self.keyword_extractor.extract(note_text)
        suggestions = self.code_mapper.map_codes(note_text)
        job = self.repository.create(
            note_text=note_text,
            source_type=source_type,
            keywords=keywords,
            suggestions=suggestions,
        )
        return self._to_detail_response(job)

    def get_job(self, job_id: int) -> CodingJobDetailResponse | None:
        job = self.repository.get(job_id)
        if not job:
            return None
        return self._to_detail_response(job)

    def list_jobs(self, limit: int, offset: int) -> list[CodingJobSummary]:
        jobs = self.repository.list_jobs(limit=limit, offset=offset)
        return [
            CodingJobSummary(
                id=job.id,
                status=job.status,
                source_type=job.source_type,
                created_at=job.created_at,
                updated_at=job.updated_at,
            )
            for job in jobs
        ]

    def finalize_job(self, job_id: int, finalized_codes: list[CodeFinalizeItem]) -> CodingJobDetailResponse | None:
        job = self.repository.get(job_id)
        if not job:
            return None

        finalized_payload = [item.model_dump(mode="json") for item in finalized_codes]
        updated = self.repository.finalize(job, finalized_payload)
        return self._to_detail_response(updated)

    @staticmethod
    def _to_detail_response(job) -> CodingJobDetailResponse:
        suggestions = [SuggestionResponse.model_validate(item) for item in (job.suggestions or [])]
        finalized_codes = None
        if job.finalized_codes is not None:
            finalized_codes = [CodeFinalizeItem.model_validate(item) for item in job.finalized_codes]

        return CodingJobDetailResponse(
            id=job.id,
            status=job.status,
            source_type=job.source_type,
            note_text=job.note_text,
            extracted_keywords=job.extracted_keywords or [],
            suggestions=suggestions,
            finalized_codes=finalized_codes,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )


def suggest_code(note_text: str) -> dict[str, float | str]:
    mapper = CodeMapper()
    suggestions = mapper.map_codes(note_text)
    if not suggestions:
        return {"suggested_code": "UNKNOWN", "confidence": 0.0}
    top = suggestions[0]
    return {"suggested_code": top["code"], "confidence": top["confidence"]}
