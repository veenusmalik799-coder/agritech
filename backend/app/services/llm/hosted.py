from typing import AsyncIterator

from app.services.llm.base import LLMError


class HostedProvider:
    """Premium tier (future): your own hosted model + auth/billing checks go here."""

    async def stream(self, messages: list[dict]) -> AsyncIterator[str]:
        raise LLMError("Hosted premium model is not available yet.")
        yield  # makes this an async generator
