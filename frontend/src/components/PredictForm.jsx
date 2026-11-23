import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Field from "./Field.jsx";
import { getWeather, predict, predictLive } from "../lib/api.js";

// min/max here are hard limits (physically impossible values); hint is the typical dataset range.
const SOIL = [
  { key: "N", label: "Nitrogen (N)", unit: "kg/ha", hint: "0–140", min: 0 },
  { key: "P", label: "Phosphorus (P)", unit: "kg/ha", hint: "5–145", min: 0 },
  { key: "K", label: "Potassium (K)", unit: "kg/ha", hint: "5–205", min: 0 },
  { key: "ph", label: "Soil pH", unit: "0–14", hint: "3.5–9.9", min: 0, max: 14 },
];
const CLIMATE = [
  { key: "temperature", label: "Temperature", unit: "°C", hint: "9–44", min: -50, max: 60 },
  { key: "humidity", label: "Humidity", unit: "%", hint: "14–100", min: 0, max: 100 },
  { key: "rainfall", label: "Rainfall", unit: "mm", hint: "20–300", min: 0 },
];

const MODES = [
  { id: "live", text: "Use my location" },
  { id: "manual", text: "Enter everything" },
];

const WEATHER_DAYS = 30; // weather is averaged over the last 30 days

// "" / null -> undefined, garbage -> NaN (caught by validation)
const num = (v) => (v === "" || v == null ? undefined : Number(v));
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

const getPosition = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    })
  );

function checkFields(fields, values) {
  for (const f of fields) {
    const x = values[f.key];
    if (x === undefined) return { missing: true };
    if (!Number.isFinite(x)) return { error: `${f.label} must be a number.` };
    if (f.min != null && x < f.min) return { error: `${f.label} can't be below ${f.min}.` };
    if (f.max != null && x > f.max) return { error: `${f.label} can't be above ${f.max}.` };
  }
  return {};
}

function FieldGrid({ fields, values, onChange, cols }) {
  return (
    <div className={`grid gap-4 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {fields.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          unit={f.unit}
          hint={f.hint}
          min={f.min}
          max={f.max}
          step="any"
          value={values[f.key] ?? ""}
          onChange={onChange(f.key)}
        />
      ))}
    </div>
  );
}

/* ---------- Map ---------- */

function ClickHandler({ onPick, disabled }) {
  useMapEvents({
    click: (e) => {
      if (disabled) return;
      const { lat, lng } = e.latlng.wrap(); // keeps lng within ±180 when the world repeats
      onPick(lat, lng);
    },
  });
  return null;
}

// Fly to the pin when it moves outside the current view (e.g. after "Use my location").
function Recenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().contains([lat, lon])) map.flyTo([lat, lon], Math.max(map.getZoom(), 6));
  }, [lat, lon, map]);
  return null;
}

function MapPicker({ coords, onPick, disabled }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-field/15">
      <MapContainer
        center={coords ? [coords.lat, coords.lon] : [20, 0]}
        zoom={coords ? 6 : 2}
        minZoom={2}
        worldCopyJump
        className="h-72 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onPick} disabled={disabled} />
        {coords && (
          <>
            <Recenter lat={coords.lat} lon={coords.lon} />
            <CircleMarker
              center={[coords.lat, coords.lon]}
              radius={7}
              pathOptions={{ color: "#fff", weight: 2, fillColor: "#b4541a", fillOpacity: 1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}

/* ---------- Form ---------- */

export default function PredictForm({ onResult }) {
  const [mode, setMode] = useState("live");
  const [v, setV] = useState({}); // soil values + manual-mode climate values
  const [coords, setCoords] = useState(null); // { lat, lon }
  const [weather, setWeather] = useState(null); // { temperature, humidity, rainfall } for live mode
  const [busy, setBusy] = useState(""); // "" | "locate" | "weather" | "predict"
  const [error, setError] = useState("");

  const mounted = useRef(true);
  const reqId = useRef(0); // ignore stale weather responses if the user re-pins quickly
  useEffect(() => {
    // StrictMode runs effect setup/cleanup once extra in development. Restore
    // the flag during setup so async geolocation/weather callbacks still work.
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const finish = () => mounted.current && setBusy("");

  const live = mode === "live";
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  function switchMode(id) {
    setMode(id);
    setError("");
  }

  // Set the location, then fetch the weather for it.
  async function pinAndFill(lat, lon) {
    const id = ++reqId.current;
    const la = Number(lat.toFixed(4));
    const lo = Number(lon.toFixed(4));
    setCoords({ lat: la, lon: lo });
    setWeather(null);
    setError("");
    setBusy("weather");
    try {
      const w = await getWeather(la, lo, WEATHER_DAYS);
      if (!mounted.current || id !== reqId.current) return;
      setWeather({
        temperature: w.temperature != null ? round(w.temperature) : undefined,
        humidity: w.humidity != null ? round(w.humidity) : undefined,
        rainfall: w.rainfall != null ? round(w.rainfall) : undefined,
      });
    } catch (e) {
      if (mounted.current && id === reqId.current) {
        setError(`Location set, but the weather lookup failed: ${e.message}`);
      }
    } finally {
      if (id === reqId.current) finish();
    }
  }

  async function useMyLocation() {
    setError("");
    if (!window.isSecureContext) {
      return setError("Location detection requires a secure page. Open the app on localhost or use HTTPS, or click the map instead.");
    }
    if (!navigator.geolocation) {
      return setError("This browser can't share your location. Click the map or switch to manual entry.");
    }
    setBusy("locate");
    try {
      const p = await getPosition();
      if (!mounted.current) return;
      await pinAndFill(p.coords.latitude, p.coords.longitude);
    } catch (err) {
      if (!mounted.current) return;
      setError(
        err.code === err.PERMISSION_DENIED
          ? "Location access was blocked. Allow it in the browser, or click the map instead."
          : err.code === err.TIMEOUT
          ? "Location detection timed out. Check your device location settings and try again, or click the map instead."
          : "Couldn't determine your location. Try again, or click the map instead."
      );
      setBusy("");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const soil = Object.fromEntries(SOIL.map((f) => [f.key, num(v[f.key])]));
    const soilCheck = checkFields(SOIL, soil);
    if (soilCheck.missing) return setError("Fill in N, P, K and pH from your soil test.");
    if (soilCheck.error) return setError(soilCheck.error);

    let body;
    if (live) {
      if (!coords) return setError("Tap “Use my location” or click the map first, or switch to manual entry.");

      body = { ...soil, lat: coords.lat, lon: coords.lon, days: WEATHER_DAYS };
      // Send the weather that was shown. If it never loaded, the server looks it up itself.
      if (weather) {
        const filled = CLIMATE.filter((f) => weather[f.key] !== undefined);
        const climateCheck = checkFields(filled, weather);
        if (climateCheck.error) return setError(climateCheck.error);
        for (const f of filled) body[f.key] = weather[f.key];
      }
    } else {
      const climate = Object.fromEntries(CLIMATE.map((f) => [f.key, num(v[f.key])]));
      const climateCheck = checkFields(CLIMATE, climate);
      if (climateCheck.missing) return setError("Fill in temperature, humidity and rainfall.");
      if (climateCheck.error) return setError(climateCheck.error);
      body = { ...soil, ...climate };
    }

    setBusy("predict");
    try {
      const res = live ? await predictLive(body) : await predict(body);
      mounted.current && onResult({ result: res, inputs: body });
    } catch (err) {
      mounted.current && setError(err.message);
    } finally {
      finish();
    }
  }

  const locating = busy === "locate" || busy === "weather";

  return (
    <form
      onSubmit={submit}
      noValidate
      className="space-y-6 rounded-xl bg-paper p-5 shadow-sm ring-1 ring-field/10 sm:p-6"
    >
      <div className="inline-flex rounded-lg bg-sage p-1 text-sm font-medium" role="radiogroup" aria-label="Input mode">
        {MODES.map(({ id, text }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            onClick={() => switchMode(id)}
            className={`rounded-md px-3 py-1.5 transition ${
              mode === id ? "bg-field text-paper" : "text-soil/70 hover:text-soil"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-field">Soil test</legend>
        <FieldGrid fields={SOIL} values={v} onChange={set} />
      </fieldset>

      {live ? (
        <fieldset>
          <legend className="mb-3 text-lg font-bold text-field">Location</legend>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={!!busy}
            className="w-full rounded-md border border-field/30 px-3 py-2.5 text-sm font-medium text-field transition hover:bg-sage disabled:opacity-50"
          >
            {busy === "locate"
              ? "Detecting location…"
              : busy === "weather"
              ? "Fetching weather…"
              : "Use my location"}
          </button>
          <p className="mt-2 text-sm text-soil/65">
            {coords && !locating
              ? `Pinned at ${coords.lat}, ${coords.lon}. Click the map to change it.`
              : "Or click the map to pin a location. Weather is fetched automatically."}
          </p>
          <MapPicker coords={coords} onPick={pinAndFill} disabled={busy === "predict"} />

          {weather && !locating && (
            <dl className="mt-3 grid grid-cols-3 gap-3 rounded-lg bg-sage p-3 text-sm">
              {CLIMATE.map((f) => (
                <div key={f.key}>
                  <dt className="text-soil/65">{f.label}</dt>
                  <dd className="font-semibold text-field">
                    {weather[f.key] != null ? `${weather[f.key]} ${f.unit}` : "n/a"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {weather && !locating && (
            <p className="mt-1 text-xs text-soil/60">Average of the last {WEATHER_DAYS} days.</p>
          )}
        </fieldset>
      ) : (
        <fieldset>
          <legend className="mb-3 text-lg font-bold text-field">Climate</legend>
          <FieldGrid fields={CLIMATE} values={v} onChange={set} cols={3} />
        </fieldset>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!!busy}
        className="w-full rounded-lg bg-field px-4 py-3 text-base font-bold text-paper transition hover:bg-field-dark disabled:opacity-60"
      >
        {busy === "predict" ? "Finding crops…" : "Recommend a crop"}
      </button>
    </form>
  );
}
