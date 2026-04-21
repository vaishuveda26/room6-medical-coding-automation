from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

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


class DoctorCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)
    specialization: str = Field(min_length=2, max_length=120)
    gender: GenderValue
    phone: str = Field(min_length=7, max_length=30)
    address: str = Field(min_length=5, max_length=255)
    qualification: str = Field(min_length=2, max_length=120)
    license_number: str = Field(min_length=3, max_length=60)
    years_of_experience: int = Field(ge=0, le=60)

    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str) -> str:
        normalized = GENDER_NORMALIZATION.get(str(value).strip().lower())
        if not normalized:
            raise ValueError("Invalid gender")
        return normalized


class DoctorUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str | None = Field(default=None, min_length=6)
    specialization: str = Field(min_length=2, max_length=120)
    gender: GenderValue
    phone: str = Field(min_length=7, max_length=30)
    address: str = Field(min_length=5, max_length=255)
    qualification: str = Field(min_length=2, max_length=120)
    license_number: str = Field(min_length=3, max_length=60)
    years_of_experience: int = Field(ge=0, le=60)

    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str) -> str:
        normalized = GENDER_NORMALIZATION.get(str(value).strip().lower())
        if not normalized:
            raise ValueError("Invalid gender")
        return normalized


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: EmailStr
    specialization: str
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    qualification: str | None = None
    license_number: str | None = None
    years_of_experience: int | None = None

    model_config = ConfigDict(from_attributes=True)
