from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "CampusFlow"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # IA
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-20b"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
