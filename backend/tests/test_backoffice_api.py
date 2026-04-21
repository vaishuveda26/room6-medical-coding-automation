import os
import tempfile
import unittest
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class BackofficeApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        cls.temp_db.close()
        cls.database_url = f"sqlite:///{cls.temp_db.name}"
        os.environ["DATABASE_URL"] = cls.database_url

        from app.auth.security import hash_password
        from app.database import get_db
        from app.models import Doctor, Medicine, Patient, User, UserRole
        from app.models.base import Base
        from app.routes import appointments, auth, dashboard, doctors, medicines, patients

        cls.hash_password = hash_password
        cls.User = User
        cls.UserRole = UserRole
        cls.Doctor = Doctor
        cls.Patient = Patient
        cls.Medicine = Medicine
        cls.Base = Base

        cls.engine = create_engine(cls.database_url, connect_args={"check_same_thread": False})
        cls.TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

        app = FastAPI()

        def override_get_db():
            db = cls.TestSessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        app.include_router(auth.router)
        app.include_router(patients.router)
        app.include_router(doctors.router)
        app.include_router(medicines.router)
        app.include_router(appointments.router)
        app.include_router(dashboard.router)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.engine.dispose()
        if os.path.exists(cls.temp_db.name):
            os.unlink(cls.temp_db.name)

    def setUp(self):
        self.Base.metadata.drop_all(bind=self.engine)
        self.Base.metadata.create_all(bind=self.engine)
        self.admin_token = self._create_user_and_login(
            name="System Admin",
            email="admin@test.com",
            password="Admin@123",
            role=self.UserRole.admin,
        )
        self.doctor_token = self._create_user_and_login(
            name="Dr. House",
            email="doctor@test.com",
            password="Doctor@123",
            role=self.UserRole.doctor,
            specialization="General Medicine",
        )

    def _create_user_and_login(self, name, email, password, role, specialization=None):
        payload = {
            "name": name,
            "email": email,
            "password": password,
            "role": role.value if hasattr(role, "value") else role,
            "specialization": specialization,
        }
        register_response = self.client.post("/auth/register", json=payload)
        self.assertIn(register_response.status_code, (200, 201))
        return register_response.json()["access_token"]

    def _auth_headers(self, token):
        return {"Authorization": f"Bearer {token}"}

    def test_patient_crud_flow(self):
        create_response = self.client.post(
            "/patients",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "John Carter",
                "age": 34,
                "gender": "Male",
                "phone": "9876543210",
                "email": "john@example.com",
                "address": "12 Main Street",
                "blood_group": "O+",
                "emergency_contact_name": "Jane Carter",
                "emergency_contact_phone": "9123456780",
            },
        )
        self.assertEqual(create_response.status_code, 201)
        patient_id = create_response.json()["id"]

        list_response = self.client.get("/patients", headers=self._auth_headers(self.admin_token))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

        update_response = self.client.put(
            f"/patients/{patient_id}",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "John Carter Updated",
                "age": 35,
                "gender": "Male",
                "phone": "9876543211",
                "email": "john.updated@example.com",
                "address": "15 Main Street",
                "blood_group": "A+",
                "emergency_contact_name": "Jane Carter",
                "emergency_contact_phone": "9123456781",
            },
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["name"], "John Carter Updated")

        delete_response = self.client.delete(f"/patients/{patient_id}", headers=self._auth_headers(self.admin_token))
        self.assertEqual(delete_response.status_code, 204)

    def test_doctor_create_and_update_flow(self):
        create_response = self.client.post(
            "/doctors",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "Dr. Strange",
                "email": "strange@test.com",
                "password": "Doctor@123",
                "specialization": "Neurology",
                "gender": "Male",
                "phone": "9999911111",
                "address": "221B Provider Street",
                "qualification": "MBBS, MD",
                "license_number": "LIC12345",
                "years_of_experience": 12,
            },
        )
        self.assertEqual(create_response.status_code, 201)
        doctor_id = create_response.json()["id"]

        update_response = self.client.put(
            f"/doctors/{doctor_id}",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "Dr. Stephen Strange",
                "email": "strange.updated@test.com",
                "specialization": "Neurosurgery",
                "gender": "Male",
                "phone": "9999922222",
                "address": "10 Metro Hospital",
                "qualification": "MBBS, MS",
                "license_number": "LIC99999",
                "years_of_experience": 14,
            },
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["specialization"], "Neurosurgery")
        self.assertEqual(update_response.json()["email"], "strange.updated@test.com")

    def test_medicine_crud_flow(self):
        create_response = self.client.post(
            "/medicines",
            headers=self._auth_headers(self.admin_token),
            json={
                "code": "MED-TEST-001",
                "name": "Test Medicine",
                "symptoms": "fever, cold",
                "dosage": "1 tablet twice daily",
                "description": "Used in tests",
            },
        )
        self.assertEqual(create_response.status_code, 201)
        medicine_id = create_response.json()["id"]

        search_response = self.client.get(
            "/medicines?search=fever",
            headers=self._auth_headers(self.admin_token),
        )
        self.assertEqual(search_response.status_code, 200)
        self.assertEqual(len(search_response.json()), 1)

        update_response = self.client.put(
            f"/medicines/{medicine_id}",
            headers=self._auth_headers(self.admin_token),
            json={
                "code": "MED-TEST-001",
                "name": "Updated Medicine",
                "symptoms": "fever, headache",
                "dosage": "1 tablet once daily",
                "description": "Updated in tests",
            },
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["name"], "Updated Medicine")

        delete_response = self.client.delete(f"/medicines/{medicine_id}", headers=self._auth_headers(self.admin_token))
        self.assertEqual(delete_response.status_code, 204)

    def test_appointment_create_and_update_flow(self):
        patient_response = self.client.post(
            "/patients",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "Patient One",
                "age": 28,
                "gender": "Female",
                "phone": "9000000001",
                "email": "patient1@test.com",
                "address": "Patient Lane",
                "blood_group": "B+",
                "emergency_contact_name": "Parent One",
                "emergency_contact_phone": "9000000011",
            },
        )
        patient_id = patient_response.json()["id"]

        doctors_response = self.client.get("/doctors", headers=self._auth_headers(self.admin_token))
        doctor_id = doctors_response.json()[0]["id"]

        appointment_time = (datetime.utcnow() + timedelta(days=1)).isoformat()
        create_response = self.client.post(
            "/appointments",
            headers=self._auth_headers(self.admin_token),
            json={
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "date": appointment_time,
                "consultation_mode": "in_person",
                "priority": "routine",
                "duration_minutes": 30,
                "reason_for_visit": "Regular health check",
                "symptoms": "mild fever",
                "notes": "Initial booking",
            },
        )
        self.assertEqual(create_response.status_code, 201)
        appointment_id = create_response.json()["id"]

        update_response = self.client.put(
            f"/appointments/{appointment_id}",
            headers=self._auth_headers(self.admin_token),
            json={
                "status": "completed",
                "consultation_mode": "video",
                "priority": "follow_up",
                "duration_minutes": 45,
                "reason_for_visit": "Follow-up review",
                "symptoms": "reduced fever",
                "notes": "Consultation completed",
            },
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["status"], "completed")
        self.assertEqual(update_response.json()["consultation_mode"], "video")

    def test_appointment_rejects_overlapping_slot(self):
        patient_one = self.client.post(
            "/patients",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "Overlap Patient One",
                "age": 30,
                "gender": "Male",
                "phone": "9111111111",
                "email": "overlap1@test.com",
                "address": "Street 1",
                "blood_group": "AB+",
                "emergency_contact_name": "Contact One",
                "emergency_contact_phone": "9222222222",
            },
        ).json()["id"]
        patient_two = self.client.post(
            "/patients",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "Overlap Patient Two",
                "age": 31,
                "gender": "Female",
                "phone": "9333333333",
                "email": "overlap2@test.com",
                "address": "Street 2",
                "blood_group": "O-",
                "emergency_contact_name": "Contact Two",
                "emergency_contact_phone": "9444444444",
            },
        ).json()["id"]

        doctor_id = self.client.get("/doctors", headers=self._auth_headers(self.admin_token)).json()[0]["id"]
        appointment_time = (datetime.utcnow() + timedelta(days=1)).isoformat()

        first_response = self.client.post(
            "/appointments",
            headers=self._auth_headers(self.admin_token),
            json={
                "patient_id": patient_one,
                "doctor_id": doctor_id,
                "date": appointment_time,
                "consultation_mode": "in_person",
                "priority": "routine",
                "duration_minutes": 60,
                "reason_for_visit": "First visit",
                "symptoms": "headache",
                "notes": "Overlap baseline",
            },
        )
        self.assertEqual(first_response.status_code, 201)

        second_response = self.client.post(
            "/appointments",
            headers=self._auth_headers(self.admin_token),
            json={
                "patient_id": patient_two,
                "doctor_id": doctor_id,
                "date": appointment_time,
                "consultation_mode": "in_person",
                "priority": "urgent",
                "duration_minutes": 30,
                "reason_for_visit": "Second visit",
                "symptoms": "pain",
                "notes": "Should fail",
            },
        )
        self.assertEqual(second_response.status_code, 400)
        self.assertIn("already has an appointment", second_response.json()["detail"])

    def test_doctor_dashboard_is_scoped(self):
        patient_response = self.client.post(
            "/patients",
            headers=self._auth_headers(self.admin_token),
            json={
                "name": "Scoped Patient",
                "age": 40,
                "gender": "Male",
                "phone": "9555555555",
                "email": "scoped@test.com",
                "address": "Scoped Street",
                "blood_group": "O+",
                "emergency_contact_name": "Scoped Contact",
                "emergency_contact_phone": "9666666666",
            },
        )
        patient_id = patient_response.json()["id"]
        doctor_id = self.client.get("/doctors", headers=self._auth_headers(self.admin_token)).json()[0]["id"]

        appointment_time = (datetime.utcnow() + timedelta(days=1)).isoformat()
        self.client.post(
            "/appointments",
            headers=self._auth_headers(self.admin_token),
            json={
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "date": appointment_time,
                "consultation_mode": "phone",
                "priority": "routine",
                "duration_minutes": 30,
                "reason_for_visit": "Scoped dashboard visit",
                "symptoms": "cough",
                "notes": "Doctor scope test",
            },
        )

        dashboard_response = self.client.get(
            "/dashboard/stats",
            headers=self._auth_headers(self.doctor_token),
        )
        self.assertEqual(dashboard_response.status_code, 200)
        payload = dashboard_response.json()
        self.assertEqual(payload["total_doctors"], 1)
        self.assertEqual(payload["total_patients"], 1)
        self.assertEqual(payload["total_appointments"], 1)
        self.assertEqual(len(payload["recent_doctors"]), 1)


if __name__ == "__main__":
    unittest.main()
