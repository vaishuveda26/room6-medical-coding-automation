from datetime import datetime, timedelta, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.auth.deps import get_current_user, require_role
from app.database import get_db
from app.models import Appointment, AppointmentStatus, Doctor, Patient, User, UserRole
from app.schemas import AppointmentCreate, AppointmentResponse, AppointmentUpdate

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def _generate_appointment_code() -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"APT-{timestamp}-{uuid4().hex[:6].upper()}"


def _normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def _to_response(appointment: Appointment) -> AppointmentResponse:
    return AppointmentResponse(
        id=appointment.id,
        appointment_code=appointment.appointment_code,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        date=appointment.date,
        status=appointment.status,
        consultation_mode=appointment.consultation_mode,
        priority=appointment.priority,
        duration_minutes=appointment.duration_minutes,
        reason_for_visit=appointment.reason_for_visit,
        symptoms=appointment.symptoms,
        notes=appointment.notes,
        patient_name=appointment.patient.name,
        doctor_name=appointment.doctor.name,
    )


def _validate_future_appointment(payload: AppointmentCreate | AppointmentUpdate) -> None:
    appointment_date = getattr(payload, "date", None)
    if appointment_date is not None and _normalize_datetime(appointment_date) <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="Appointment date must be later than the current time")


def _validate_doctor_slot(
    db: Session,
    doctor_id: int,
    appointment_date: datetime,
    duration_minutes: int,
    exclude_appointment_id: int | None = None,
) -> None:
    normalized_appointment_date = _normalize_datetime(appointment_date)
    appointment_end = normalized_appointment_date + timedelta(minutes=duration_minutes)
    query = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status.in_([AppointmentStatus.scheduled, AppointmentStatus.completed]),
    )

    if exclude_appointment_id is not None:
        query = query.filter(Appointment.id != exclude_appointment_id)

    conflicting_appointments = query.all()
    for existing in conflicting_appointments:
        existing_start = _normalize_datetime(existing.date)
        existing_end = existing_start + timedelta(minutes=existing.duration_minutes)
        overlaps = normalized_appointment_date < existing_end and appointment_end > existing_start
        if overlaps:
            raise HTTPException(
                status_code=400,
                detail="Doctor already has an appointment scheduled during this time slot",
            )


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin)),
):
    if not db.get(Patient, payload.patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")
    if not db.get(Doctor, payload.doctor_id):
        raise HTTPException(status_code=404, detail="Doctor not found")
    _validate_future_appointment(payload)
    _validate_doctor_slot(db, payload.doctor_id, payload.date, payload.duration_minutes)

    appointment = Appointment(
        appointment_code=_generate_appointment_code(),
        **payload.model_dump(),
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return _to_response(appointment)


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = None,
    status_filter: AppointmentStatus | None = None,
):
    query = db.query(Appointment)

    if current_user.role == UserRole.doctor:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            return []
        query = query.filter(Appointment.doctor_id == doctor.id)

    if search:
        pattern = f"%{search}%"
        query = query.join(Patient).join(Doctor).filter(
            or_(
                Appointment.appointment_code.ilike(pattern),
                Appointment.reason_for_visit.ilike(pattern),
                Appointment.symptoms.ilike(pattern),
                Patient.name.ilike(pattern),
                Doctor.name.ilike(pattern),
            )
        )

    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    appointments = query.order_by(Appointment.date.desc()).all()
    return [_to_response(item) for item in appointments]


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    updated_patient_id = payload.patient_id if payload.patient_id is not None else appointment.patient_id
    updated_doctor_id = payload.doctor_id if payload.doctor_id is not None else appointment.doctor_id
    updated_date = payload.date if payload.date is not None else appointment.date
    updated_duration_minutes = (
        payload.duration_minutes if payload.duration_minutes is not None else appointment.duration_minutes
    )

    if current_user.role == UserRole.doctor:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Access denied")
        if payload.patient_id is not None or payload.doctor_id is not None or payload.date is not None:
            raise HTTPException(status_code=403, detail="Doctors cannot reschedule appointments")

    if payload.patient_id is not None and not db.get(Patient, payload.patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")
    if payload.doctor_id is not None and not db.get(Doctor, payload.doctor_id):
        raise HTTPException(status_code=404, detail="Doctor not found")
    if payload.date is not None:
        _validate_future_appointment(payload)

    if (
        payload.doctor_id is not None
        or payload.date is not None
        or payload.duration_minutes is not None
    ):
        _validate_doctor_slot(
            db,
            updated_doctor_id,
            updated_date,
            updated_duration_minutes,
            exclude_appointment_id=appointment.id,
        )

    if payload.patient_id is not None:
        appointment.patient_id = payload.patient_id
    if payload.doctor_id is not None:
        appointment.doctor_id = payload.doctor_id
    if payload.date is not None:
        appointment.date = payload.date

    if payload.status is not None:
        appointment.status = payload.status
    if payload.consultation_mode is not None:
        appointment.consultation_mode = payload.consultation_mode
    if payload.priority is not None:
        appointment.priority = payload.priority
    if payload.duration_minutes is not None:
        appointment.duration_minutes = payload.duration_minutes
    if payload.reason_for_visit is not None:
        appointment.reason_for_visit = payload.reason_for_visit
    if payload.symptoms is not None:
        appointment.symptoms = payload.symptoms
    if payload.notes is not None:
        appointment.notes = payload.notes

    db.commit()
    db.refresh(appointment)
    return _to_response(appointment)
