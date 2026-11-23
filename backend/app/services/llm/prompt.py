from app.schemas.chat import FarmContext

BASE = (
    "You are an agriculture assistant for farmers. Give practical, specific, safe advice. "
    "Use the farm data below when relevant. If unsure, say so and suggest consulting a local "
    "agricultural extension officer. Keep answers short and in simple language."
)


def build_system_prompt(ctx: FarmContext | None) -> str:
    if not ctx:
        return BASE
    parts = [BASE, "\n--- FARM DATA ---"]
    if ctx.inputs:
        i = ctx.inputs
        parts.append(f"Soil: N={i.N}, P={i.P}, K={i.K}, pH={i.ph}")
        parts.append(f"Climate: {i.temperature}°C, {i.humidity}% humidity, {i.rainfall} mm rain")
    if ctx.weather:
        w = ctx.weather
        parts.append(f"Location: ({w.lat}, {w.lon}), weather averaged over last {w.days} days")
    if ctx.prediction:
        p = ctx.prediction
        alts = ", ".join(f"{t.crop} ({t.probability:.0%})" for t in p.top)
        parts.append(f"ML recommendation: {p.crop} ({p.confidence:.0%}). Top: {alts}")
    return "\n".join(parts)
