from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, predict, weather
from app.core.config import settings
from app.ml.predictor import ModelNotTrained, load_bundle


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_bundle()  # warm the model once at startup
        app.state.model_ready = True
    except ModelNotTrained as e:
        print(f"[warn] {e}")
        app.state.model_ready = False
    yield


app = FastAPI(title="Agri ML API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],  # includes X-LLM-Key
)
app.include_router(predict.router)
app.include_router(weather.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"ok": True, "model_ready": app.state.model_ready}
