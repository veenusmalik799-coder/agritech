from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    cors_origins: list[str] = ["http://localhost:5173"]
    model_path: str = "app/ml/artifacts/crop_model.joblib"
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3.5:4b"
    open_meteo_url: str = "https://api.open-meteo.com/v1/forecast"
    hosted_enabled: bool = False


settings = Settings()
