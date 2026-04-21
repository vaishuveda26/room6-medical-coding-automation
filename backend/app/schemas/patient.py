from pydantic import BaseModel, ConfigDict, Field


class PatientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=0, le=120)
    gender: str
    phone: str


class PatientResponse(PatientCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
