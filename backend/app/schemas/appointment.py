from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.appointment import AppointmentStatus


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    date: datetime


class AppointmentUpdate(BaseModel):
    status: AppointmentStatus | None = None
    notes: str | None = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    date: datetime
    status: AppointmentStatus
    notes: str | None = None
    patient_name: str
    doctor_name: str

    model_config = ConfigDict(from_attributes=True)
