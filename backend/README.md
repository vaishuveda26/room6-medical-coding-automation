# Medical Coding Automation MVP Backend

Production-structured FastAPI backend for medical coding suggestion workflows.

## Tech Stack
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite

## Features
- Accept medical note as text or uploaded file (`.txt`, UTF-8)
- Rule-based keyword extraction
- Keyword-to-code mapping (ICD-10 / CPT) from predefined dictionary
- Suggestions returned with confidence and evidence snippets
- Edit/finalize codes per job
- Persist all jobs/results in SQLite

## Project Structure
```text
app/
  api/v1/endpoints/coding.py      # HTTP routes
  core/config.py                  # App settings
  core/database.py                # SQLAlchemy setup
  core/code_dictionary.py         # Predefined ICD/CPT dictionary
  core/container.py               # Dependency wiring
  models/coding_job.py            # SQLAlchemy model
  repositories/coding_repository.py
  schemas/coding.py               # Pydantic request/response schemas
  services/keyword_extractor.py   # Rule-based keyword extraction
  services/code_mapper.py         # Keyword -> code mapping + evidence
  services/file_parser.py         # Upload parsing/validation
  services/coding_service.py      # Application service logic
  main.py                         # FastAPI app entry
tests/
```

## Step-by-Step: Run Locally
1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start API server:
   ```bash
   uvicorn app.main:app --reload
   ```
4. Open docs:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - Health: `http://127.0.0.1:8000/health`

## API Endpoints
- `GET /health`
- `GET /api/health`
- `GET /api/v1/coding/status`
- `POST /api/v1/coding/suggestions/text`
- `POST /api/v1/coding/suggestions/file`
- `POST /api/v1/coding/jobs` (unified input: text or file)
- `GET /api/v1/coding/jobs`
- `GET /api/v1/coding/jobs/{job_id}`
- `PUT /api/v1/coding/jobs/{job_id}/finalize`

## Example Requests

### 1) Create suggestions from text
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/coding/suggestions/text" \
  -H "Content-Type: application/json" \
  -d '{"note_text":"Established patient follow-up for diabetes and hypertension. On metformin."}'
```

### 2) Create suggestions from file
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/coding/suggestions/file" \
  -F "note_file=@note.txt"
```

### 3) Finalize selected codes
```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/coding/jobs/1/finalize" \
  -H "Content-Type: application/json" \
  -d '{
    "finalized_codes": [
      {
        "code": "E11.9",
        "code_type": "ICD-10",
        "description": "Type 2 diabetes mellitus without complications",
        "selected": true
      }
    ]
  }'
```

## Validation & Error Handling
- Request body/field validation via Pydantic
- File-type and encoding validation for uploads
- `404` when job does not exist
- Global exception handlers for validation and unexpected errors

## Notes
- SQLite DB file is created as `medical_coding.db`.
- Dictionary is intentionally small for MVP and easy extension in `app/core/code_dictionary.py`.