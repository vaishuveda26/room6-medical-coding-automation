from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.deps import require_role
from app.auth.security import hash_password
from app.database import get_db
from app.models import Doctor, User, UserRole
from app.schemas import DoctorCreate, DoctorResponse

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

    doctor = Doctor(user_id=user.id, name=payload.name, specialization=payload.specialization)
    db.add(doctor)

    db.commit()
    db.refresh(doctor)
    return doctor


@router.get("", response_model=list[DoctorResponse])
def list_doctors(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.doctor)),
):
    return db.query(Doctor).order_by(Doctor.id.desc()).all()
