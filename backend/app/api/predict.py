from fastapi import APIRouter, HTTPException

from app.ml.predictor import ModelNotTrained, predict_crop
from app.schemas.predict import CropInput, CropPrediction, LivePredictRequest, LivePredictResponse
from app.services.weather import WeatherError, fetch_weather

router = APIRouter(tags=["predict"])


@router.post("/predict", response_model=CropPrediction)
def predict(data: CropInput):
    """Fully manual input."""
    try:
        return predict_crop(data)
    except ModelNotTrained as e:
        raise HTTPException(503, str(e))


@router.post("/predict/live", response_model=LivePredictResponse)
async def predict_live(req: LivePredictRequest):
    """Soil manual + climate from lat/lon. Any climate field you send overrides the API value."""
    try:
        w = await fetch_weather(req.lat, req.lon, req.days)
    except WeatherError as e:
        raise HTTPException(502, str(e))

    inputs = CropInput(
        N=req.N, P=req.P, K=req.K, ph=req.ph,
        temperature=req.temperature if req.temperature is not None else w.temperature,
        humidity=req.humidity if req.humidity is not None else w.humidity,
        rainfall=req.rainfall if req.rainfall is not None else w.rainfall,
    )
    try:
        pred = predict_crop(inputs)
    except ModelNotTrained as e:
        raise HTTPException(503, str(e))
    return LivePredictResponse(inputs=inputs, weather=w, prediction=pred)
