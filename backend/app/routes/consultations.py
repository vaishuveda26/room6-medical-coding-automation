from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.auth.deps import get_current_user, require_role
from app.database import get_db
from app.models import Appointment, AppointmentPrescription, Doctor, Medicine, Patient, User, UserRole
from app.schemas import ConsultationResponse, ConsultationUpdate

router = APIRouter(prefix="/consultations", tags=["Consultations"])


def _to_response(appointment: Appointment) -> ConsultationResponse:
    return ConsultationResponse(
        id=appointment.id,
        appointment_code=appointment.appointment_code,
        date=appointment.date,
        status=appointment.status,
        consultation_mode=appointment.consultation_mode,
        patient_id=appointment.patient_id,
        patient_name=appointment.patient.name,
        patient_age=appointment.patient.age,
        patient_gender=appointment.patient.gender,
        patient_phone=appointment.patient.phone,
        doctor_id=appointment.doctor_id,
        doctor_name=appointment.doctor.name,
        reason_for_visit=appointment.reason_for_visit,
        symptoms=appointment.symptoms,
        notes=appointment.notes,
        prescriptions=[
            {
                "id": prescription.id,
                "medicine_id": prescription.medicine_id,
                "medicine_code": prescription.medicine.code,
                "medicine_name": prescription.medicine.name,
                "dosage": prescription.dosage,
                "instructions": prescription.instructions,
            }
            for prescription in appointment.prescriptions
        ],
    )


@router.get("", response_model=list[ConsultationResponse])
def list_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = None,
):
    query = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor),
        joinedload(Appointment.prescriptions).joinedload(AppointmentPrescription.medicine),
    )

    if current_user.role == UserRole.doctor:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor:
            return []
        query = query.filter(Appointment.doctor_id == doctor.id)
    else:
        require_role(UserRole.admin, UserRole.doctor)(current_user)

    if search:
        pattern = f"%{search}%"
        query = query.join(Appointment.patient).join(Appointment.doctor).filter(
            (Appointment.appointment_code.ilike(pattern))
            | (Appointment.reason_for_visit.ilike(pattern))
            | (Appointment.symptoms.ilike(pattern))
            | (Doctor.name.ilike(pattern))
            | (Patient.name.ilike(pattern))
        )

    appointments = query.order_by(Appointment.date.desc()).all()
    return [_to_response(appointment) for appointment in appointments]


@router.put("/{appointment_id}", response_model=ConsultationResponse)
def update_consultation(
    appointment_id: int,
    payload: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.patient),
            joinedload(Appointment.doctor),
            joinedload(Appointment.prescriptions).joinedload(AppointmentPrescription.medicine),
        )
        .filter(Appointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(status_code=404, detail="Consultation appointment not found")

    if current_user.role == UserRole.doctor:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not doctor or appointment.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        require_role(UserRole.admin, UserRole.doctor)(current_user)

    if payload.status is not None:
        appointment.status = payload.status
    if payload.consultation_mode is not None:
        appointment.consultation_mode = payload.consultation_mode
    if payload.notes is not None:
        appointment.notes = payload.notes
    if payload.symptoms is not None:
        appointment.symptoms = payload.symptoms
    if payload.reason_for_visit is not None:
        appointment.reason_for_visit = payload.reason_for_visit

    if payload.prescriptions is not None:
        medicine_ids = [item.medicine_id for item in payload.prescriptions]
        existing_medicines = {
            medicine.id: medicine
            for medicine in db.query(Medicine).filter(Medicine.id.in_(medicine_ids)).all()
        }
        missing_ids = [medicine_id for medicine_id in medicine_ids if medicine_id not in existing_medicines]
        if missing_ids:
            raise HTTPException(status_code=404, detail=f"Medicine not found for ids: {missing_ids}")

        appointment.prescriptions.clear()
        db.flush()

        for item in payload.prescriptions:
            appointment.prescriptions.append(
                AppointmentPrescription(
                    medicine_id=item.medicine_id,
                    dosage=item.dosage,
                    instructions=item.instructions,
                )
            )

    db.commit()
    db.refresh(appointment)
    appointment = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.patient),
            joinedload(Appointment.doctor),
            joinedload(Appointment.prescriptions).joinedload(AppointmentPrescription.medicine),
        )
        .filter(Appointment.id == appointment_id)
        .first()
    )
    return _to_response(appointment)
