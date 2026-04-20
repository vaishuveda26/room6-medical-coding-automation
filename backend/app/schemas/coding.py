from pydantic import BaseModel


class CodingRequest(BaseModel):
    note_text: str


class CodingResponse(BaseModel):
    suggested_code: str
    confidence: float
