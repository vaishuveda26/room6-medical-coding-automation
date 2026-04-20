from pydantic import BaseModel


class Patient(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
