from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.coding_repository import CodingJobRepository
from app.services.coding_service import CodingService


def get_coding_service(db: Session = Depends(get_db)) -> CodingService:
    repository = CodingJobRepository(db)
    return CodingService(repository=repository)