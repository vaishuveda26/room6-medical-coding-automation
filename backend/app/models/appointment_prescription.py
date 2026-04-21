from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class AppointmentPrescription(Base):
    __tablename__ = "appointment_prescriptions"
    __table_args__ = (
        UniqueConstraint("appointment_id", "medicine_id", name="uq_appointment_medicine"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    appointment_id: Mapped[int] = mapped_column(ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    medicine_id: Mapped[int] = mapped_column(ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    dosage: Mapped[str | None] = mapped_column(String(255), nullable=True)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    appointment = relationship("Appointment", back_populates="prescriptions")
    medicine = relationship("Medicine", back_populates="appointment_prescriptions")
