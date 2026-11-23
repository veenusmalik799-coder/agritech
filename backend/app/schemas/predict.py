from pydantic import BaseModel, Field

from app.schemas.weather import WeatherSummary


class CropInput(BaseModel):
    # soil (manual / lab test / soil-health card)
    N: float = Field(ge=0, le=300, description="Nitrogen, kg/ha")
    P: float = Field(ge=0, le=300, description="Phosphorus, kg/ha")
    K: float = Field(ge=0, le=300, description="Potassium, kg/ha")
    ph: float = Field(ge=0, le=14)
    # climate (manual OR auto-filled from weather API)
    temperature: float = Field(ge=-10, le=55, description="°C")
    humidity: float = Field(ge=0, le=100, description="%")
    rainfall: float = Field(ge=0, le=1000, description="mm")


class LivePredictRequest(BaseModel):
    """Soil values are manual; climate comes from lat/lon unless overridden."""
    N: float = Field(ge=0, le=300)
    P: float = Field(ge=0, le=300)
    K: float = Field(ge=0, le=300)
    ph: float = Field(ge=0, le=14)
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    days: int = Field(default=30, ge=1, le=90)
    temperature: float | None = None
    humidity: float | None = None
    rainfall: float | None = None


class CropScore(BaseModel):
    crop: str
    probability: float


class CropPrediction(BaseModel):
    crop: str
    confidence: float
    top: list[CropScore]
    warnings: list[str] = []


class LivePredictResponse(BaseModel):
    inputs: CropInput
    weather: WeatherSummary
    prediction: CropPrediction
