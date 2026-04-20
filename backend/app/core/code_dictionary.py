from dataclasses import dataclass


@dataclass(frozen=True)
class CodeDictionaryEntry:
    code: str
    code_type: str
    description: str
    keywords: tuple[str, ...]


CODE_DICTIONARY: tuple[CodeDictionaryEntry, ...] = (
    CodeDictionaryEntry(
        code="E11.9",
        code_type="ICD-10",
        description="Type 2 diabetes mellitus without complications",
        keywords=("diabetes", "hyperglycemia", "metformin", "a1c"),
    ),
    CodeDictionaryEntry(
        code="I10",
        code_type="ICD-10",
        description="Essential (primary) hypertension",
        keywords=("hypertension", "high blood pressure", "bp elevated", "lisinopril"),
    ),
    CodeDictionaryEntry(
        code="J06.9",
        code_type="ICD-10",
        description="Acute upper respiratory infection, unspecified",
        keywords=("upper respiratory infection", "uri", "cough", "sore throat"),
    ),
    CodeDictionaryEntry(
        code="99213",
        code_type="CPT",
        description="Office/outpatient E/M visit, established patient, low complexity",
        keywords=("follow-up", "established patient", "outpatient visit"),
    ),
    CodeDictionaryEntry(
        code="93000",
        code_type="CPT",
        description="Electrocardiogram, routine ECG with interpretation and report",
        keywords=("ecg", "ekg", "electrocardiogram"),
    ),
)