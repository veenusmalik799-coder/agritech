from typing import Literal

from pydantic import BaseModel

from app.schemas.predict import CropInput, CropPrediction
from app.schemas.weather import WeatherSummary


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class FarmContext(BaseModel):
    inputs: CropInput | None = None
    prediction: CropPrediction | None = None
    weather: WeatherSummary | None = None


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    provider: Literal["ollama", "openai", "anthropic", "gemini", "hosted"] = "ollama"
    model: str | None = None
    context: FarmContext | None = None
