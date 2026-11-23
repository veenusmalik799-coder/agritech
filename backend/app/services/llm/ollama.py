import json
from typing import AsyncIterator

import httpx

from app.core.config import settings
from app.services.llm.base import LLMError


class OllamaProvider:
    """Desktop tier: local model through Ollama."""

    def __init__(self, model: str | None = None):
        self.model = model or settings.ollama_model

    async def stream(self, messages: list[dict]) -> AsyncIterator[str]:
        payload = {"model": self.model, "messages": messages, "stream": True}
        try:
            async with httpx.AsyncClient(timeout=None) as c:
                async with c.stream("POST", f"{settings.ollama_url}/api/chat", json=payload) as r:
                    if r.status_code >= 400:
                        raise LLMError(f"Ollama {r.status_code}: {(await r.aread()).decode()[:200]}")
                    async for line in r.aiter_lines():
                        if not line:
                            continue
                        chunk = json.loads(line)
                        if tok := chunk.get("message", {}).get("content"):
                            yield tok
                        if chunk.get("done"):
                            break
        except httpx.ConnectError as e:
            raise LLMError("Can't reach Ollama. Is `ollama serve` running?") from e
