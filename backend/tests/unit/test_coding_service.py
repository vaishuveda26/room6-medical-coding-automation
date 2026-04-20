from app.services.coding_service import suggest_code


def test_suggest_code_empty_note() -> None:
    result = suggest_code("")
    assert result["suggested_code"] == "UNKNOWN"
