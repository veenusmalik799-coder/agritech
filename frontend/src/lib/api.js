const BASE = "/api";

async function request(path, opts) {
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const b = await res.json();
      msg = typeof b.detail === "string" ? b.detail : JSON.stringify(b.detail ?? b);
    } catch {}
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res.json();
}

const post = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const getHealth = () => request("/health");
export const getWeather = (lat, lon, days) =>
  request(`/weather?lat=${lat}&lon=${lon}&days=${days}`);
export const predict = (body) => post("/predict", body);
export const predictLive = (body) => post("/predict/live", body);

// SSE over fetch (EventSource can't send POST bodies or custom headers)
export async function streamChat({ payload, key, onToken, signal }) {
  const headers = { "Content-Type": "application/json" };
  if (key) headers["X-LLM-Key"] = key;

  const res = await fetch(BASE + "/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    buf += dec.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop();
    for (const e of events) {
      if (e.startsWith("event: error")) {
        const line = e.split("data: ")[1] ?? "{}";
        throw new Error(JSON.parse(line).error ?? "Chat error");
      }
      const d = e.replace(/^data: /, "").trim();
      if (!d) continue;
      if (d === "[DONE]") return;
      onToken(JSON.parse(d).token);
    }
  }
}