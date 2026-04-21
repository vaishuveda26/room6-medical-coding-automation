from sqlalchemy import inspect, text
from app.database import engine


PATIENT_COLUMN_STATEMENTS = {
    "email": "ALTER TABLE patients ADD COLUMN email VARCHAR(255)",
    "address": "ALTER TABLE patients ADD COLUMN address VARCHAR(255)",
    "blood_group": "ALTER TABLE patients ADD COLUMN blood_group VARCHAR(10)",
    "emergency_contact_name": "ALTER TABLE patients ADD COLUMN emergency_contact_name VARCHAR(120)",
    "emergency_contact_phone": "ALTER TABLE patients ADD COLUMN emergency_contact_phone VARCHAR(30)",
}

DOCTOR_COLUMN_STATEMENTS = {
    "gender": "ALTER TABLE doctors ADD COLUMN gender VARCHAR(20)",
    "phone": "ALTER TABLE doctors ADD COLUMN phone VARCHAR(30)",
    "address": "ALTER TABLE doctors ADD COLUMN address VARCHAR(255)",
    "qualification": "ALTER TABLE doctors ADD COLUMN qualification VARCHAR(120)",
    "license_number": "ALTER TABLE doctors ADD COLUMN license_number VARCHAR(60)",
    "years_of_experience": "ALTER TABLE doctors ADD COLUMN years_of_experience INTEGER",
}

APPOINTMENT_COLUMN_STATEMENTS = {
    "appointment_code": "ALTER TABLE appointments ADD COLUMN appointment_code VARCHAR(40)",
    "consultation_mode": "ALTER TABLE appointments ADD COLUMN consultation_mode VARCHAR(20) DEFAULT 'in_person' NOT NULL",
    "priority": "ALTER TABLE appointments ADD COLUMN priority VARCHAR(20) DEFAULT 'routine' NOT NULL",
    "duration_minutes": "ALTER TABLE appointments ADD COLUMN duration_minutes INTEGER DEFAULT 30 NOT NULL",
    "reason_for_visit": "ALTER TABLE appointments ADD COLUMN reason_for_visit VARCHAR(255) DEFAULT 'General consultation' NOT NULL",
    "symptoms": "ALTER TABLE appointments ADD COLUMN symptoms TEXT",
}


def _ensure_columns(table_name: str, statements: dict[str, str]) -> None:
    inspector = inspect(engine)
    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
    missing_columns = [name for name in statements if name not in existing_columns]

    if not missing_columns:
        return

    with engine.begin() as connection:
        for column_name in missing_columns:
            connection.execute(text(statements[column_name]))


def run_startup_migrations() -> None:
    _ensure_columns("patients", PATIENT_COLUMN_STATEMENTS)
    _ensure_columns("doctors", DOCTOR_COLUMN_STATEMENTS)
    _ensure_columns("appointments", APPOINTMENT_COLUMN_STATEMENTS)

    with engine.begin() as connection:
        connection.execute(text("UPDATE appointments SET appointment_code = 'APT-' || id WHERE appointment_code IS NULL"))
        connection.execute(text("UPDATE appointments SET status = 'scheduled' WHERE status = 'pending'"))
        connection.execute(text("UPDATE patients SET gender = 'Male' WHERE lower(gender) = 'male'"))
        connection.execute(text("UPDATE patients SET gender = 'Female' WHERE lower(gender) = 'female'"))
        connection.execute(text("UPDATE patients SET gender = 'Other' WHERE lower(gender) = 'other'"))
        connection.execute(text("UPDATE patients SET gender = 'Male' WHERE lower(gender) = 'm'"))
        connection.execute(text("UPDATE patients SET gender = 'Female' WHERE lower(gender) = 'f'"))
        connection.execute(text("UPDATE patients SET gender = 'Other' WHERE lower(gender) = 'o'"))
        connection.execute(text("UPDATE doctors SET gender = 'Male' WHERE lower(gender) = 'male'"))
        connection.execute(text("UPDATE doctors SET gender = 'Female' WHERE lower(gender) = 'female'"))
        connection.execute(text("UPDATE doctors SET gender = 'Other' WHERE lower(gender) = 'other'"))
        connection.execute(text("UPDATE doctors SET gender = 'Male' WHERE lower(gender) = 'm'"))
        connection.execute(text("UPDATE doctors SET gender = 'Female' WHERE lower(gender) = 'f'"))
        connection.execute(text("UPDATE doctors SET gender = 'Other' WHERE lower(gender) = 'o'"))
