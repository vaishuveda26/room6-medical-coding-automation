from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole


class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole


class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
