from pydantic import BaseModel, ConfigDict, Field


class MedicineBase(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=2, max_length=120)
    symptoms: str = Field(min_length=3)
    dosage: str | None = Field(default=None, max_length=255)
    description: str | None = None


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(MedicineBase):
    pass


class MedicineResponse(MedicineBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
