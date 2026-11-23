"""Train once offline:  python -m app.ml.train [path/to/Crop_recommendation.csv]

Dataset: Kaggle "Crop Recommendation Dataset" (Atharva Ingle) -> 2200 rows, 22 crops.
Columns: N, P, K, temperature, humidity, ph, rainfall, label
"""
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import cross_val_score, train_test_split

from app.core.config import settings
from app.ml.features import FEATURES, TARGET


def main(csv_path: str = "data/Crop_recommendation.csv") -> None:
    df = pd.read_csv(csv_path)
    missing = set(FEATURES + [TARGET]) - set(df.columns)
    if missing:
        raise SystemExit(f"CSV missing columns: {missing}")

    X, y = df[FEATURES], df[TARGET]
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    model = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)
    model.fit(X_tr, y_tr)

    pred = model.predict(X_te)
    print(f"test accuracy : {accuracy_score(y_te, pred):.4f}")
    print(f"5-fold CV     : {cross_val_score(model, X, y, cv=5).mean():.4f}")
    print(classification_report(y_te, pred))

    bundle = {
        "model": model,
        "features": FEATURES,
        "ranges": {f: (float(X[f].min()), float(X[f].max())) for f in FEATURES},
    }
    out = Path(settings.model_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, out)
    print(f"saved -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:2])
