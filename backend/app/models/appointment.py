import enum
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class ConsultationMode(str, enum.Enum):
    in_person = "in_person"
    video = "video"
    phone = "phone"


class AppointmentPriority(str, enum.Enum):
    routine = "routine"
    urgent = "urgent"
    follow_up = "follow_up"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus),
        default=AppointmentStatus.scheduled,
        nullable=False,
    )
    consultation_mode: Mapped[ConsultationMode] = mapped_column(
        Enum(ConsultationMode),
        default=ConsultationMode.in_person,
        nullable=False,
    )
    priority: Mapped[AppointmentPriority] = mapped_column(
        Enum(AppointmentPriority),
        default=AppointmentPriority.routine,
        nullable=False,
    )
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    reason_for_visit: Mapped[str] = mapped_column(String(255), nullable=False)
    symptoms: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    prescriptions = relationship(
        "AppointmentPrescription",
        back_populates="appointment",
        cascade="all, delete-orphan",
    )
