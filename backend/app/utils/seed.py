from sqlalchemy.orm import Session
from app.auth.security import hash_password
from app.models import Doctor, User, UserRole


def seed_sample_users(db: Session):
    admin_email = "admin@medauto.com"
    doctor_email = "doctor@medauto.com"

    admin = db.query(User).filter(User.email == admin_email).first()
    if not admin:
        admin = User(
            name="System Admin",
            email=admin_email,
            password_hash=hash_password("Admin@123"),
            role=UserRole.admin,
        )
        db.add(admin)

    doctor_user = db.query(User).filter(User.email == doctor_email).first()
    if not doctor_user:
        doctor_user = User(
            name="Dr. Sarah Lee",
            email=doctor_email,
            password_hash=hash_password("Doctor@123"),
            role=UserRole.doctor,
        )
        db.add(doctor_user)
        db.flush()

        doctor_profile = Doctor(
            user_id=doctor_user.id,
            name=doctor_user.name,
            specialization="Cardiology",
        )
        db.add(doctor_profile)

    db.commit()
