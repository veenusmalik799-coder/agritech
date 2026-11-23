from typing import AsyncIterator, Protocol


class LLMError(RuntimeError):
    pass


class LLMProvider(Protocol):
    def stream(self, messages: list[dict]) -> AsyncIterator[str]:
        """Yield text tokens. messages = [{'role': 'system'|'user'|'assistant', 'content': str}]"""
        ...
