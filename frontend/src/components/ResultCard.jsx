// The backend response shape isn't pinned down, so this reads common key names.
const pct = (x) => (x == null ? null : x <= 1 ? Math.round(x * 100) : Math.round(x));

function normalizeTop(res) {
  const raw = res.top ?? res.top_k ?? res.alternatives ?? res.probabilities;
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.map((r) =>
      typeof r === "string"
        ? { crop: r }
        : { crop: r.crop ?? r.label ?? r.name, p: r.probability ?? r.confidence ?? r.score }
    );
  return Object.entries(raw)
    .map(([crop, p]) => ({ crop, p }))
    .sort((a, b) => b.p - a.p);
}

export default function ResultCard({ result, inputs }) {
  if (!result) {
    return (
      <div className="rounded-xl border-2 border-dashed border-field/25 p-8 text-center text-soil/60">
        Enter your soil test and climate to see which crop fits best.
      </div>
    );
  }

  const pred = result.prediction ?? result; // unwrap if nested
  const crop = pred.crop ?? "Unknown";
  const conf = pct(pred.confidence);
  const top = normalizeTop(pred).slice(0, 5);
  const warnings = pred.warnings ?? result.warnings ?? [];
  const w = result.weather ?? result.climate;

  return (
    <div className="overflow-hidden rounded-xl bg-field text-paper shadow-sm">
      <div className="p-6 sm:p-8">
        <p className="text-sm text-paper/70">Best match for your field</p>
        <h2 className="mt-1 text-5xl font-bold capitalize leading-tight text-wheat sm:text-6xl">{crop}</h2>
        {conf != null && <p className="mt-2 text-paper/80">{conf}% confidence</p>}

        {top.length > 1 && (
          <ul className="mt-6 space-y-2">
            {top.map((t) => {
              const p = pct(t.p);
              return (
                <li key={t.crop} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3 text-sm">
                  <span className="truncate capitalize">{t.crop}</span>
                  <span className="h-2 rounded-full bg-paper/15">
                    <span className="block h-2 rounded-full bg-wheat" style={{ width: `${p ?? 0}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-paper/75">{p != null ? `${p}%` : ""}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(w || inputs) && (
        <dl className="grid grid-cols-3 gap-px bg-paper/15 text-center text-sm">
          {[
            ["Temperature", (w?.temperature ?? inputs?.temperature), "°C"],
            ["Humidity", (w?.humidity ?? inputs?.humidity), "%"],
            ["Rainfall", (w?.rainfall ?? inputs?.rainfall), "mm"],
          ].map(([label, val, unit]) => (
            <div key={label} className="bg-field-dark px-2 py-3">
              <dt className="text-paper/65">{label}</dt>
              <dd className="font-bold">{val != null ? `${Number(val).toFixed(1)} ${unit}` : "from weather"}</dd>
            </div>
          ))}
        </dl>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1 bg-wheat/20 px-6 py-4 text-sm">
          {warnings.map((m, i) => (
            <li key={i}>
              <span className="font-bold text-wheat">Check this: </span>
              {typeof m === "string" ? m : JSON.stringify(m)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}