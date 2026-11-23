import json
from typing import AsyncIterator

import httpx

from app.services.llm.base import LLMError

OPENAI_COMPAT_BASES = {
    "openai": "https://api.openai.com/v1",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai",
}
DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "gemini": "gemini-2.0-flash",
    "anthropic": "claude-sonnet-5-5",
}


async def _check(r: httpx.Response) -> None:
    if r.status_code >= 400:
        body = (await r.aread()).decode()[:300]
        raise LLMError(f"Provider returned {r.status_code}: {body}")


class OpenAICompatProvider:
    """BYOK for OpenAI and Gemini (Gemini exposes an OpenAI-compatible endpoint)."""

    def __init__(self, provider: str, api_key: str, model: str | None = None):
        self.base = OPENAI_COMPAT_BASES[provider]
        self.key = api_key
        self.model = model or DEFAULT_MODELS[provider]

    async def stream(self, messages: list[dict]) -> AsyncIterator[str]:
        headers = {"Authorization": f"Bearer {self.key}"}
        payload = {"model": self.model, "messages": messages, "stream": True}
        async with httpx.AsyncClient(timeout=None) as c:
            async with c.stream("POST", f"{self.base}/chat/completions", headers=headers, json=payload) as r:
                await _check(r)
                async for line in r.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    choices = json.loads(data).get("choices") or []
                    if choices and (tok := choices[0].get("delta", {}).get("content")):
                        yield tok


class AnthropicProvider:
    def __init__(self, api_key: str, model: str | None = None):
        self.key = api_key
        self.model = model or DEFAULT_MODELS["anthropic"]

    async def stream(self, messages: list[dict]) -> AsyncIterator[str]:
        system = "\n".join(m["content"] for m in messages if m["role"] == "system")
        msgs = [m for m in messages if m["role"] != "system"]
        headers = {"x-api-key": self.key, "anthropic-version": "2023-06-01"}
        payload = {"model": self.model, "max_tokens": 1024, "system": system, "messages": msgs, "stream": True}
        async with httpx.AsyncClient(timeout=None) as c:
            async with c.stream("POST", "https://api.anthropic.com/v1/messages", headers=headers, json=payload) as r:
                await _check(r)
                async for line in r.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    ev = json.loads(line[6:])
                    if ev.get("type") == "content_block_delta" and ev["delta"].get("type") == "text_delta":
                        yield ev["delta"]["text"]
