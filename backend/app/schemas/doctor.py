from pydantic import BaseModel, ConfigDict, EmailStr


class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    specialization: str


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    name: str
    specialization: str

    model_config = ConfigDict(from_attributes=True)
