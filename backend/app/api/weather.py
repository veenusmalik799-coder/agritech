from fastapi import APIRouter, HTTPException, Query

from app.schemas.weather import WeatherSummary
from app.services.weather import WeatherError, fetch_weather

router = APIRouter(tags=["weather"])


@router.get("/weather", response_model=WeatherSummary)
async def weather(
    lat: float = Query(ge=-90, le=90),
    lon: float = Query(ge=-180, le=180),
    days: int = Query(30, ge=1, le=90),
):
    """Used by the frontend's 'use my location' button to autofill climate fields."""
    try:
        return await fetch_weather(lat, lon, days)
    except WeatherError as e:
        raise HTTPException(502, str(e))
