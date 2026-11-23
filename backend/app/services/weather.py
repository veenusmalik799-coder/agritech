import asyncio
import time
from datetime import date, timedelta
from statistics import mean

import httpx

from app.core.config import settings
from app.schemas.weather import WeatherSummary


class WeatherError(RuntimeError):
    pass


MAX_RETRIES = 2
BASE_BACKOFF = 0.5  # seconds
MAX_WAIT = 10  # cap per retry

_cache: dict[tuple, tuple[float, WeatherSummary]] = {}
CACHE_TTL = 6 * 3600  # seconds


async def _open_meteo(lat: float, lon: float, days: int = 30) -> WeatherSummary:
    """Open-Meteo: free, no API key. Aggregates the last `days` days.

    Retries on 429 (rate-limited) with exponential backoff, honoring the
    Retry-After header when Open-Meteo provides one.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum",
        "past_days": days,
        "forecast_days": 1,
        "timezone": "auto",
    }
    r: httpx.Response | None = None
    for attempt in range(MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                r = await c.get(settings.open_meteo_url, params=params)
        except httpx.HTTPError as e:
            if attempt < MAX_RETRIES:
                await asyncio.sleep(BASE_BACKOFF * (2**attempt))
                continue
            raise WeatherError(f"Weather API failed: {e}") from e

        if r.status_code == 429:
            if attempt < MAX_RETRIES:
                try:
                    wait = float(r.headers.get("retry-after", ""))
                except ValueError:
                    wait = BASE_BACKOFF * (2**attempt)
                await asyncio.sleep(min(wait, MAX_WAIT))
                continue
            raise WeatherError("Weather API rate-limited. Please try again shortly.")

        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            try:
                reason = r.json().get("reason", "")
            except Exception:
                reason = ""
            raise WeatherError(f"Weather API error {r.status_code}: {reason}") from e
        break

    assert r is not None
    d = r.json().get("daily", {})
    clean = lambda k: [v for v in d.get(k, []) if v is not None]
    t, h, p = clean("temperature_2m_mean"), clean("relative_humidity_2m_mean"), clean("precipitation_sum")
    if not (t and h):
        raise WeatherError("Weather API returned no data for this location.")

    return WeatherSummary(
        lat=lat, lon=lon, days=days,
        temperature=round(mean(t), 1),
        humidity=round(mean(h), 1),
        rainfall=round(sum(p), 1),
    )


async def fetch_weather(lat: float, lon: float, days: int = 30) -> WeatherSummary:
    """Public entry: cache + Open-Meteo with NASA POWER fallback."""
    key = (round(lat, 2), round(lon, 2), days)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < CACHE_TTL:
        return hit[1]

    try:
        result = await _open_meteo(lat, lon, days)
    except WeatherError:
        result = await _nasa_power(lat, lon, days)  # raises WeatherError if this fails too

    _cache[key] = (time.time(), result)
    return result


async def _nasa_power(lat: float, lon: float, days: int) -> WeatherSummary:
    """NASA POWER: free, no key, ~2 days behind real time. Good fallback."""
    end = date.today() - timedelta(days=2)
    start = end - timedelta(days=days - 1)
    params = {
        "parameters": "T2M,RH2M,PRECTOTCORR",
        "community": "AG",
        "latitude": lat,
        "longitude": lon,
        "start": start.strftime("%Y%m%d"),
        "end": end.strftime("%Y%m%d"),
        "format": "JSON",
    }
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get("https://power.larc.nasa.gov/api/temporal/daily/point", params=params)
            r.raise_for_status()
        p = r.json()["properties"]["parameter"]
    except (httpx.HTTPError, KeyError, ValueError) as e:
        raise WeatherError(f"Weather unavailable: Open-Meteo limit reached and NASA fallback failed ({e})") from e

    clean = lambda k: [v for v in p.get(k, {}).values() if v != -999]  # -999 = missing
    t, h, rain = clean("T2M"), clean("RH2M"), clean("PRECTOTCORR")
    if not (t and h):
        raise WeatherError("Weather API returned no data for this location.")

    return WeatherSummary(
        lat=lat, lon=lon, days=days,
        temperature=round(mean(t), 1),
        humidity=round(mean(h), 1),
        rainfall=round(sum(rain), 1),
    )
