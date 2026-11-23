# Agri ML Backend (FastAPI)

## Run
```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# put Kaggle "Crop Recommendation Dataset" CSV at data/Crop_recommendation.csv
python -m app.ml.train                                  # creates app/ml/artifacts/crop_model.joblib
uvicorn app.main:app --reload                           # docs at http://localhost:8000/docs
```

## What data to take

| Field | Source | Unit | Training range (Kaggle crop dataset) |
|---|---|---|---|
| N | manual (soil test / soil-health card) | kg/ha | ~0-140 |
| P | manual | kg/ha | ~5-145 |
| K | manual | kg/ha | ~5-205 |
| ph | manual (or SoilGrids later) | 0-14 | ~3.5-9.9 |
| temperature | weather API (mean of last N days) or manual | °C | ~9-44 |
| humidity | weather API (mean of last N days) or manual | % | ~14-100 |
| rainfall | weather API (sum of last N days) or manual | mm | ~20-300 |
| lat, lon | browser geolocation | deg | - |

Label: `label` = crop name (22 crops). Weather APIs cannot give soil N/P/K, so those stay manual.
Caveat: the Kaggle dataset's rainfall is a coarse seasonal-ish figure; summing 30 days from Open-Meteo is an
approximation. The API returns `warnings` when a value falls outside the training range. Tune `days` if results look off.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | /health | liveness + model loaded? |
| GET | /weather?lat&lon&days | autofill climate fields |
| POST | /predict | all 7 values manual |
| POST | /predict/live | soil manual + lat/lon, climate auto (any climate field overrides) |
| POST | /chat | SSE stream from the AI helper |

## Chat usage
```jsonc
// POST /chat   (desktop, local)
{ "provider": "ollama", "messages": [{"role":"user","content":"Leaves turning yellow?"}],
  "context": { "inputs": {...}, "prediction": {...}, "weather": {...} } }

// mobile BYOK: key goes in a HEADER, never the body
//   X-LLM-Key: sk-...
{ "provider": "anthropic" | "openai" | "gemini", "model": "optional", "messages": [...] }
```
Stream format: `data: {"token":"..."}` repeated, then `data: [DONE]`. Errors arrive as `event: error`.

## Frontend: reading the stream
```js
const res = await fetch("/chat", { method:"POST", headers:{ "Content-Type":"application/json", "X-LLM-Key": key },
  body: JSON.stringify(payload) });
const reader = res.body.getReader(), dec = new TextDecoder(); let buf = "";
while (true) {
  const { done, value } = await reader.read(); if (done) break;
  buf += dec.decode(value, { stream: true });
  const events = buf.split("\n\n"); buf = events.pop();
  for (const e of events) {
    if (e.startsWith("event: error")) throw new Error(JSON.parse(e.split("data: ")[1]).error);
    const d = e.replace(/^data: /, ""); if (d === "[DONE]") return;
    onToken(JSON.parse(d).token);
  }
}
```
(Use fetch, not EventSource: EventSource can't send POST bodies or custom headers.)

## Layout
```
app/main.py              app, CORS, lifespan loads model once
app/core/config.py       env settings
app/ml/{features,train,predictor}.py
app/schemas/             pydantic: predict, weather, chat
app/services/weather.py  Open-Meteo client
app/services/llm/        base (interface) | ollama | byok | hosted (stub) | factory | prompt
app/api/                 predict, weather, chat routers
```

## Self-test Q&A
**Q1. Why load the model in `lifespan` and cache it?**
A. Loading a joblib file per request is slow. `lru_cache` + startup warm-up loads it once.

**Q2. Why is the BYOK key in a header, not the JSON body?**
A. Bodies get logged/validated/echoed in errors more often; a header keeps the key out of schemas and request dumps. Never store or log it server-side.

**Q3. Why `fetch` + ReadableStream instead of `EventSource`?**
A. `EventSource` is GET-only with no custom headers, so it can't send the chat body or `X-LLM-Key`.

**Q4. How do you add the hosted premium tier later?**
A. Implement `HostedProvider.stream`, add auth + usage checks, set `HOSTED_ENABLED=true`. Nothing else changes because everything goes through `get_provider`.

**Q5. Why return top-3 + `warnings` instead of one label?**
A. Random forest probabilities show how sure the model is, and out-of-range inputs mean the model is extrapolating.

**Q6. Why does `/predict/live` let the user override climate values?**
A. Weather averages are an approximation; farmers may know their local rainfall better, so any provided field wins.

**Q7. What breaks if you change feature order in `features.py` after training?**
A. Predictions silently go wrong. The bundle stores `features`, and the predictor reads columns by that saved list; retrain after any change.

**Q8. Add a new provider (e.g. Groq)?**
A. It's OpenAI-compatible: add its base URL to `OPENAI_COMPAT_BASES`, a default model, and the name to the `Literal` in `ChatRequest`.
