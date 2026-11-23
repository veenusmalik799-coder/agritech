from pydantic import BaseModel


class WeatherSummary(BaseModel):
    lat: float
    lon: float
    days: int
    temperature: float   # mean daily temp, °C
    humidity: float      # mean relative humidity, %
    rainfall: float      # total precipitation over `days`, mm
    source: str = "open-meteo"
