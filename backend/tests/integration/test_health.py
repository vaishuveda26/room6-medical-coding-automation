import os

from fastapi.testclient import TestClient

from app.main import app


def setup_module() -> None:
    db_path = "medical_coding.db"
    if os.path.exists(db_path):
        os.remove(db_path)


def test_health_check() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_and_finalize_coding_job_from_text() -> None:
    client = TestClient(app)

    create_response = client.post(
        "/api/v1/coding/suggestions/text",
        json={"note_text": "Established patient follow-up for diabetes and hypertension. On metformin."},
    )

    assert create_response.status_code == 201
    created_payload = create_response.json()
    assert created_payload["id"] > 0
    assert len(created_payload["suggestions"]) >= 2
    assert any(item["code"] == "E11.9" for item in created_payload["suggestions"])

    job_id = created_payload["id"]
    finalize_response = client.put(
        f"/api/v1/coding/jobs/{job_id}/finalize",
        json={
            "finalized_codes": [
                {
                    "code": "E11.9",
                    "code_type": "ICD-10",
                    "description": "Type 2 diabetes mellitus without complications",
                    "selected": True,
                }
            ]
        },
    )

    assert finalize_response.status_code == 200
    finalized_payload = finalize_response.json()
    assert finalized_payload["status"] == "finalized"
    assert finalized_payload["finalized_codes"][0]["code"] == "E11.9"


def test_create_job_from_file() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/v1/coding/suggestions/file",
        files={"note_file": ("note.txt", b"Patient has persistent cough and sore throat.", "text/plain")},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["source_type"] == "file"
    assert any(item["code"] == "J06.9" for item in payload["suggestions"])