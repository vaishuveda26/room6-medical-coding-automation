from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class EvidenceItem(BaseModel):
    keyword: str
    context: str


class SuggestionResponse(BaseModel):
    code: str
    code_type: str = Field(..., pattern=r"^(ICD-10|CPT)$")
    description: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence: list[EvidenceItem]


class CodeFinalizeItem(BaseModel):
    code: str = Field(..., min_length=3, max_length=10)
    code_type: str = Field(..., pattern=r"^(ICD-10|CPT)$")
    description: str = Field(..., min_length=3)
    selected: bool = True


class FinalizeCodesRequest(BaseModel):
    finalized_codes: list[CodeFinalizeItem] = Field(..., min_length=1)


class CodingJobSummary(BaseModel):
    id: int
    status: str
    source_type: str
    created_at: datetime
    updated_at: datetime


class CodingJobDetailResponse(BaseModel):
    id: int
    status: str
    source_type: str
    note_text: str
    extracted_keywords: list[str]
    suggestions: list[SuggestionResponse]
    finalized_codes: list[CodeFinalizeItem] | None = None
    created_at: datetime
    updated_at: datetime


class TextSuggestionRequest(BaseModel):
    note_text: str = Field(..., min_length=5, max_length=20000)

    @field_validator("note_text")
    @classmethod
    def note_text_must_have_meaningful_content(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("note_text cannot be empty or whitespace.")
        return value.strip()