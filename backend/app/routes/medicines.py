from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.auth.deps import require_role
from app.database import get_db
from app.models import Medicine, UserRole
from app.schemas import MedicineCreate, MedicineResponse, MedicineUpdate

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    payload: MedicineCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin)),
):
    existing_medicine = db.query(Medicine).filter(Medicine.code == payload.code).first()
    if existing_medicine:
        raise HTTPException(status_code=400, detail="Medicine code already exists")

    medicine = Medicine(**payload.model_dump())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


@router.get("", response_model=list[MedicineResponse])
def list_medicines(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin, UserRole.doctor)),
    search: str | None = Query(default=None),
):
    query = db.query(Medicine)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Medicine.name.ilike(pattern),
                Medicine.code.ilike(pattern),
                Medicine.symptoms.ilike(pattern),
                Medicine.description.ilike(pattern),
            )
        )
    return query.order_by(Medicine.name.asc()).all()


@router.put("/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    payload: MedicineUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin)),
):
    medicine = db.get(Medicine, medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    existing_medicine = db.query(Medicine).filter(Medicine.code == payload.code, Medicine.id != medicine_id).first()
    if existing_medicine:
        raise HTTPException(status_code=400, detail="Medicine code already exists")

    for field, value in payload.model_dump().items():
        setattr(medicine, field, value)

    db.commit()
    db.refresh(medicine)
    return medicine


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin)),
):
    medicine = db.get(Medicine, medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(medicine)
    db.commit()
    return None
