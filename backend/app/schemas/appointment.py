from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.appointment import AppointmentPriority, AppointmentStatus, ConsultationMode


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    date: datetime
    consultation_mode: ConsultationMode = ConsultationMode.in_person
    priority: AppointmentPriority = AppointmentPriority.routine
    duration_minutes: int = Field(default=30, ge=15, le=180)
    reason_for_visit: str = Field(min_length=3, max_length=255)
    symptoms: str | None = None
    notes: str | None = None


class AppointmentUpdate(BaseModel):
    patient_id: int | None = None
    doctor_id: int | None = None
    date: datetime | None = None
    status: AppointmentStatus | None = None
    consultation_mode: ConsultationMode | None = None
    priority: AppointmentPriority | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=180)
    reason_for_visit: str | None = Field(default=None, min_length=3, max_length=255)
    symptoms: str | None = None
    notes: str | None = None


class AppointmentResponse(BaseModel):
    id: int
    appointment_code: str
    patient_id: int
    doctor_id: int
    date: datetime
    status: AppointmentStatus
    consultation_mode: ConsultationMode
    priority: AppointmentPriority
    duration_minutes: int
    reason_for_visit: str
    symptoms: str | None = None
    notes: str | None = None
    patient_name: str
    doctor_name: str

    model_config = ConfigDict(from_attributes=True)
