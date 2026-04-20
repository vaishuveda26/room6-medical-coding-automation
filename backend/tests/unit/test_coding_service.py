from app.services.coding_service import suggest_code


def test_suggest_code_empty_note() -> None:
    result = suggest_code("")
    assert result["suggested_code"] == "UNKNOWN"


def test_suggest_code_diabetes_note() -> None:
    result = suggest_code("Patient has diabetes and is on metformin")
    assert result["suggested_code"] == "E11.9"
    assert result["confidence"] >= 0.55