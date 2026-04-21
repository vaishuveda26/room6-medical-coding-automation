from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.auth.deps import require_role
from app.database import get_db
from app.models import Appointment, AppointmentStatus, Doctor, Patient, UserRole
from app.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.doctor)),
):
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_doctors = db.query(func.count(Doctor.id)).scalar() or 0
    total_appointments = db.query(func.count(Appointment.id)).scalar() or 0

    pending_appointments = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.pending)
        .scalar()
        or 0
    )
    completed_appointments = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.completed)
        .scalar()
        or 0
    )

    return DashboardStats(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        pending_appointments=pending_appointments,
        completed_appointments=completed_appointments,
    )
