from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.appointment import AppointmentStatus, ConsultationMode


class ConsultationPrescriptionItem(BaseModel):
    medicine_id: int
    dosage: str | None = Field(default=None, max_length=255)
    instructions: str | None = None


class ConsultationPrescriptionResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_code: str
    medicine_name: str
    dosage: str | None = None
    instructions: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ConsultationUpdate(BaseModel):
    status: AppointmentStatus | None = None
    consultation_mode: ConsultationMode | None = None
    notes: str | None = None
    symptoms: str | None = None
    reason_for_visit: str | None = Field(default=None, min_length=3, max_length=255)
    prescriptions: list[ConsultationPrescriptionItem] = Field(default_factory=list)


class ConsultationResponse(BaseModel):
    id: int
    appointment_code: str
    date: datetime
    status: AppointmentStatus
    consultation_mode: ConsultationMode
    patient_id: int
    patient_name: str
    patient_age: int
    patient_gender: str
    patient_phone: str
    doctor_id: int
    doctor_name: str
    reason_for_visit: str
    symptoms: str | None = None
    notes: str | None = None
    prescriptions: list[ConsultationPrescriptionResponse]

    model_config = ConfigDict(from_attributes=True)
