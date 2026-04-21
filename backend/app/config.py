import os
from functools import lru_cache
from dotenv import load_dotenv


load_dotenv()


class Settings:
    app_name: str = os.getenv("APP_NAME", "Medical Automation API")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./medical_automation.db")
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    cors_origins: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
