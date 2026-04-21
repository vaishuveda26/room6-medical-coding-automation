from sqlalchemy.orm import Session
from app.auth.security import hash_password
from app.models import Doctor, Medicine, User, UserRole

DEFAULT_MEDICINES = [
    {
        "code": "MED-PCM-500",
        "name": "Paracetamol 500mg",
        "symptoms": "fever, headache, mild body pain",
        "dosage": "1 tablet after food up to 3 times daily",
        "description": "Common first-line option for fever and mild pain relief.",
    },
    {
        "code": "MED-AMX-500",
        "name": "Amoxicillin 500mg",
        "symptoms": "bacterial throat infection, ear infection, sinus infection",
        "dosage": "As prescribed by doctor",
        "description": "Prescription antibiotic for common bacterial infections.",
    },
    {
        "code": "MED-CET-10",
        "name": "Cetirizine 10mg",
        "symptoms": "allergy, sneezing, runny nose, itching",
        "dosage": "1 tablet once daily",
        "description": "Antihistamine used for common allergy symptoms.",
    },
    {
        "code": "MED-OMZ-20",
        "name": "Omeprazole 20mg",
        "symptoms": "acidity, heartburn, gastric irritation",
        "dosage": "1 capsule before breakfast",
        "description": "Used for acid reflux and stomach acid reduction.",
    },
    {
        "code": "MED-ORS-01",
        "name": "ORS Sachet",
        "symptoms": "dehydration, diarrhea, vomiting",
        "dosage": "Mix in clean water and sip through the day",
        "description": "Oral rehydration support for fluid and electrolyte replacement.",
    },
]


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


def seed_default_medicines(db: Session):
    existing_codes = {
        code for (code,) in db.query(Medicine.code).filter(Medicine.code.in_([item["code"] for item in DEFAULT_MEDICINES])).all()
    }

    for medicine_data in DEFAULT_MEDICINES:
        if medicine_data["code"] in existing_codes:
            continue
        db.add(Medicine(**medicine_data))

    db.commit()
