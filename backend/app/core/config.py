"""Application configuration.

Values are read from environment variables (see ``.env.example``) with sensible
defaults so the app runs out of the box for local development.
"""
import os
from pathlib import Path

# backend/ directory (config.py -> core -> app -> backend)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings:
    PROJECT_NAME: str = "Report Generator API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"

    # Default to a local SQLite file inside backend/.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'report.db'}"
    )

    # Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")


settings = Settings()
