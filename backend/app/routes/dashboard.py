from datetime import datetime, time, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.auth.deps import require_role
from app.database import get_db
from app.models import Appointment, AppointmentStatus, Doctor, Medicine, Patient, User, UserRole
from app.schemas import DashboardAppointmentItem, DashboardRecentItem, DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _appointment_item(appointment: Appointment) -> DashboardAppointmentItem:
    return DashboardAppointmentItem(
        id=appointment.id,
        appointment_code=appointment.appointment_code,
        patient_name=appointment.patient.name,
        doctor_name=appointment.doctor.name,
        date=appointment.date,
        status=appointment.status.value if hasattr(appointment.status, "value") else str(appointment.status),
        priority=appointment.priority.value if hasattr(appointment.priority, "value") else str(appointment.priority),
        consultation_mode=appointment.consultation_mode.value if hasattr(appointment.consultation_mode, "value") else str(appointment.consultation_mode),
        reason_for_visit=appointment.reason_for_visit,
    )


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin, UserRole.doctor)),
    status_filter: AppointmentStatus | None = None,
    doctor_id: int | None = None,
):
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_doctors = db.query(func.count(Doctor.id)).scalar() or 0
    total_medicines = db.query(func.count(Medicine.id)).scalar() or 0
    total_appointments = db.query(func.count(Appointment.id)).scalar() or 0

    scheduled_appointments = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.scheduled)
        .scalar()
        or 0
    )
    completed_appointments = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.completed)
        .scalar()
        or 0
    )
    cancelled_appointments = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.cancelled)
        .scalar()
        or 0
    )
    no_show_appointments = (
        db.query(func.count(Appointment.id))
        .filter(Appointment.status == AppointmentStatus.no_show)
        .scalar()
        or 0
    )

    today = datetime.now().date()
    today_start = datetime.combine(today, time.min)
    tomorrow_start = today_start + timedelta(days=1)
    day_after_tomorrow_start = today_start + timedelta(days=2)

    base_appointment_query = db.query(Appointment)
    if current_user.role == UserRole.doctor:
        doctor_profile = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor_profile:
            filtered_appointments = []
            today_appointments = []
            tomorrow_appointments = []
        else:
            base_appointment_query = base_appointment_query.filter(Appointment.doctor_id == doctor_profile.id)
            today_appointments = (
                base_appointment_query.filter(Appointment.date >= today_start, Appointment.date < tomorrow_start)
                .order_by(Appointment.date.asc())
                .limit(10)
                .all()
            )
            tomorrow_appointments = (
                base_appointment_query.filter(Appointment.date >= tomorrow_start, Appointment.date < day_after_tomorrow_start)
                .order_by(Appointment.date.asc())
                .limit(10)
                .all()
            )
            filtered_query = base_appointment_query
            if status_filter:
                filtered_query = filtered_query.filter(Appointment.status == status_filter)
            filtered_appointments = filtered_query.order_by(Appointment.date.asc()).limit(12).all()
    else:
        today_appointments = (
            base_appointment_query.filter(Appointment.date >= today_start, Appointment.date < tomorrow_start)
            .order_by(Appointment.date.asc())
            .limit(10)
            .all()
        )
        tomorrow_appointments = (
            base_appointment_query.filter(Appointment.date >= tomorrow_start, Appointment.date < day_after_tomorrow_start)
            .order_by(Appointment.date.asc())
            .limit(10)
            .all()
        )
        filtered_query = base_appointment_query
        if doctor_id:
            filtered_query = filtered_query.filter(Appointment.doctor_id == doctor_id)
        if status_filter:
            filtered_query = filtered_query.filter(Appointment.status == status_filter)
        filtered_appointments = filtered_query.order_by(Appointment.date.asc()).limit(12).all()

    recent_patients = [
        DashboardRecentItem(id=patient.id, title=patient.name, subtitle=f"{patient.gender} | {patient.phone}")
        for patient in db.query(Patient).order_by(Patient.id.desc()).limit(5).all()
    ]
    recent_doctors = [
        DashboardRecentItem(id=doctor.id, title=doctor.name, subtitle=doctor.specialization)
        for doctor in db.query(Doctor).order_by(Doctor.id.desc()).limit(5).all()
    ]
    recent_medicines = [
        DashboardRecentItem(id=medicine.id, title=medicine.name, subtitle=medicine.code)
        for medicine in db.query(Medicine).order_by(Medicine.id.desc()).limit(5).all()
    ]

    return DashboardStats(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_medicines=total_medicines,
        total_appointments=total_appointments,
        scheduled_appointments=scheduled_appointments,
        completed_appointments=completed_appointments,
        cancelled_appointments=cancelled_appointments,
        no_show_appointments=no_show_appointments,
        today_appointments_count=len(today_appointments),
        tomorrow_appointments_count=len(tomorrow_appointments),
        recent_patients=recent_patients,
        recent_doctors=recent_doctors,
        recent_medicines=recent_medicines,
        today_appointments=[_appointment_item(item) for item in today_appointments],
        tomorrow_appointments=[_appointment_item(item) for item in tomorrow_appointments],
        filtered_appointments=[_appointment_item(item) for item in filtered_appointments],
    )
