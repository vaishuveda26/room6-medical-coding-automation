from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Medical Coding Automation API"
    environment: str = "development"
    database_url: str = "sqlite:///./medical_coding.db"


settings = Settings()