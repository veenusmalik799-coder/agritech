from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.schemas.predict import CropInput, CropPrediction, CropScore


class ModelNotTrained(RuntimeError):
    pass


@lru_cache(maxsize=1)
def load_bundle() -> dict:
    p = Path(settings.model_path)
    if not p.exists():
        raise ModelNotTrained(
            f"{p} not found. Put the CSV in data/ and run: python -m app.ml.train"
        )
    return joblib.load(p)


def predict_crop(data: CropInput, top_k: int = 3) -> CropPrediction:
    b = load_bundle()
    feats = b["features"]
    row = data.model_dump()
    x = pd.DataFrame([[row[f] for f in feats]], columns=feats)

    proba = b["model"].predict_proba(x)[0]
    classes = b["model"].classes_
    order = np.argsort(proba)[::-1][:top_k]

    warnings = []
    for f in feats:
        lo, hi = b["ranges"][f]
        if not lo <= row[f] <= hi:
            warnings.append(
                f"{f}={row[f]} is outside the training range ({lo:.1f}-{hi:.1f}); "
                "prediction may be unreliable."
            )

    top = [CropScore(crop=str(classes[i]), probability=round(float(proba[i]), 4)) for i in order]
    return CropPrediction(crop=top[0].crop, confidence=top[0].probability, top=top, warnings=warnings)
