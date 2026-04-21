from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.deps import require_role
from app.auth.security import hash_password
from app.database import get_db
from app.models import Doctor, User, UserRole
from app.schemas import DoctorCreate, DoctorResponse, DoctorUpdate

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin)),
):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.doctor,
    )
    db.add(user)
    db.flush()

    doctor = Doctor(
        user_id=user.id,
        name=payload.name,
        specialization=payload.specialization,
        gender=payload.gender,
        phone=payload.phone,
        address=payload.address,
        qualification=payload.qualification,
        license_number=payload.license_number,
        years_of_experience=payload.years_of_experience,
    )
    db.add(doctor)

    db.commit()
    db.refresh(doctor)
    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        name=doctor.name,
        email=user.email,
        specialization=doctor.specialization,
        gender=doctor.gender,
        phone=doctor.phone,
        address=doctor.address,
        qualification=doctor.qualification,
        license_number=doctor.license_number,
        years_of_experience=doctor.years_of_experience,
    )


def _to_response(doctor: Doctor) -> DoctorResponse:
    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        name=doctor.name,
        email=doctor.user.email,
        specialization=doctor.specialization,
        gender=doctor.gender,
        phone=doctor.phone,
        address=doctor.address,
        qualification=doctor.qualification,
        license_number=doctor.license_number,
        years_of_experience=doctor.years_of_experience,
    )


@router.get("", response_model=list[DoctorResponse])
def list_doctors(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.doctor)),
):
    doctors = db.query(Doctor).join(User, Doctor.user_id == User.id).order_by(Doctor.id.desc()).all()
    return [_to_response(doctor) for doctor in doctors]


@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    payload: DoctorUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin)),
):
    doctor = db.get(Doctor, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    existing_user = db.query(User).filter(User.email == payload.email, User.id != doctor.user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = doctor.user
    user.name = payload.name
    user.email = payload.email
    if payload.password:
        user.password_hash = hash_password(payload.password)

    doctor.name = payload.name
    doctor.specialization = payload.specialization
    doctor.gender = payload.gender
    doctor.phone = payload.phone
    doctor.address = payload.address
    doctor.qualification = payload.qualification
    doctor.license_number = payload.license_number
    doctor.years_of_experience = payload.years_of_experience

    db.commit()
    db.refresh(doctor)
    return _to_response(doctor)
