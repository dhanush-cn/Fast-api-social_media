# app/config.py
import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_hostname: Optional[str] = "localhost"
    database_port: Optional[str] = "5432"
    database_password: Optional[str] = "postgres"
    database_name: Optional[str] = "fastapi"
    database_username: Optional[str] = "postgres"
    secret_key: Optional[str] = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    algorithm: Optional[str] = "HS256"
    access_token_expire_minutes: Optional[int] = 60
    database_url_env: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        # Check direct DATABASE_URL environment variable (from Render / Supabase / Neon)
        raw_url = self.database_url_env or os.getenv("DATABASE_URL")
        if raw_url:
            if raw_url.startswith("postgres://"):
                return raw_url.replace("postgres://", "postgresql://", 1)
            return raw_url

        return (
            f"postgresql://{self.database_username}:{self.database_password}"
            f"@{self.database_hostname}:{self.database_port}/{self.database_name}"
        )

settings = Settings()