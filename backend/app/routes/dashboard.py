from datetime import datetime, time, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
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
    today = datetime.now().date()
    today_start = datetime.combine(today, time.min)
    tomorrow_start = today_start + timedelta(days=1)
    day_after_tomorrow_start = today_start + timedelta(days=2)

    doctor_profile = None
    if current_user.role == UserRole.doctor:
        doctor_profile = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor_profile:
            return DashboardStats(
                total_patients=0,
                total_doctors=0,
                total_medicines=db.query(func.count(Medicine.id)).scalar() or 0,
                total_appointments=0,
                scheduled_appointments=0,
                completed_appointments=0,
                cancelled_appointments=0,
                no_show_appointments=0,
                today_appointments_count=0,
                tomorrow_appointments_count=0,
                recent_patients=[],
                recent_doctors=[],
                recent_medicines=[],
                today_appointments=[],
                tomorrow_appointments=[],
                filtered_appointments=[],
            )

    base_appointment_query = db.query(Appointment)
    if current_user.role == UserRole.doctor:
        base_appointment_query = base_appointment_query.filter(Appointment.doctor_id == doctor_profile.id)
        total_patients = (
            db.query(func.count(distinct(Appointment.patient_id)))
            .filter(Appointment.doctor_id == doctor_profile.id)
            .scalar()
            or 0
        )
        total_doctors = 1
        total_medicines = db.query(func.count(Medicine.id)).scalar() or 0
    else:
        total_patients = db.query(func.count(Patient.id)).scalar() or 0
        total_doctors = db.query(func.count(Doctor.id)).scalar() or 0
        total_medicines = db.query(func.count(Medicine.id)).scalar() or 0
        if doctor_id:
            base_appointment_query = base_appointment_query.filter(Appointment.doctor_id == doctor_id)

    total_appointments = base_appointment_query.count()
    scheduled_appointments = base_appointment_query.filter(Appointment.status == AppointmentStatus.scheduled).count()
    completed_appointments = base_appointment_query.filter(Appointment.status == AppointmentStatus.completed).count()
    cancelled_appointments = base_appointment_query.filter(Appointment.status == AppointmentStatus.cancelled).count()
    no_show_appointments = base_appointment_query.filter(Appointment.status == AppointmentStatus.no_show).count()

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

    if current_user.role == UserRole.doctor:
        recent_patient_rows = (
            db.query(Patient, Appointment.date)
            .join(Appointment, Appointment.patient_id == Patient.id)
            .filter(Appointment.doctor_id == doctor_profile.id)
            .order_by(Appointment.date.desc())
            .all()
        )
        seen_patient_ids = set()
        recent_patients = []
        for patient, _ in recent_patient_rows:
            if patient.id in seen_patient_ids:
                continue
            seen_patient_ids.add(patient.id)
            recent_patients.append(
                DashboardRecentItem(id=patient.id, title=patient.name, subtitle=f"{patient.gender} | {patient.phone}")
            )
            if len(recent_patients) == 5:
                break

        recent_doctors = [
            DashboardRecentItem(
                id=doctor_profile.id,
                title=doctor_profile.name,
                subtitle=doctor_profile.specialization,
            )
        ]
        recent_medicines = []
    else:
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
