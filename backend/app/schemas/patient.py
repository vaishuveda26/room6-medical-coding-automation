from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

GenderValue = Literal["Male", "Female", "Other", "Prefer not to say"]

GENDER_NORMALIZATION = {
    "m": "Male",
    "male": "Male",
    "f": "Female",
    "female": "Female",
    "o": "Other",
    "other": "Other",
    "na": "Prefer not to say",
    "n/a": "Prefer not to say",
    "prefer not to say": "Prefer not to say",
    "prefer_not_to_say": "Prefer not to say",
}


class PatientCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=0, le=120)
    gender: GenderValue
    phone: str = Field(min_length=7, max_length=30)
    email: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=255)
    blood_group: str | None = Field(default=None, max_length=10)
    emergency_contact_name: str | None = Field(default=None, max_length=120)
    emergency_contact_phone: str | None = Field(default=None, max_length=30)

    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str) -> str:
        normalized = GENDER_NORMALIZATION.get(str(value).strip().lower())
        if not normalized:
            raise ValueError("Invalid gender")
        return normalized


class PatientUpdate(PatientCreate):
    pass


class PatientResponse(PatientCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
