from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = ""
    jwt_secret: str = ""
    jwt_expiration_minutes: int = 480
    corse_origens: str = "http://localhost:4200"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()