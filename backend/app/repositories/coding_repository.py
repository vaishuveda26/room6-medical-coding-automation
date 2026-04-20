from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.coding_job import CodingJob


class CodingJobRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, *, note_text: str, source_type: str, keywords: list[str], suggestions: list[dict]) -> CodingJob:
        job = CodingJob(
            note_text=note_text,
            source_type=source_type,
            status="suggested",
            extracted_keywords=keywords,
            suggestions=suggestions,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get(self, job_id: int) -> CodingJob | None:
        return self.db.query(CodingJob).filter(CodingJob.id == job_id).first()

    def list_jobs(self, *, limit: int = 50, offset: int = 0) -> list[CodingJob]:
        return (
            self.db.query(CodingJob)
            .order_by(CodingJob.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def finalize(self, job: CodingJob, finalized_codes: list[dict]) -> CodingJob:
        job.finalized_codes = finalized_codes
        job.status = "finalized"
        job.updated_at = datetime.now(timezone.utc)
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job
