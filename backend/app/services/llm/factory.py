from app.core.config import settings
from app.schemas.chat import ChatRequest
from app.services.llm.base import LLMError, LLMProvider
from app.services.llm.byok import AnthropicProvider, OpenAICompatProvider
from app.services.llm.hosted import HostedProvider
from app.services.llm.ollama import OllamaProvider


def get_provider(req: ChatRequest, api_key: str | None) -> LLMProvider:
    if req.provider == "ollama":
        return OllamaProvider(req.model)
    if req.provider == "hosted":
        if not settings.hosted_enabled:
            raise LLMError("Hosted premium model is not available yet.")
        return HostedProvider()
    if not api_key:
        raise LLMError("Missing API key. Send it in the X-LLM-Key header.")
    if req.provider == "anthropic":
        return AnthropicProvider(api_key, req.model)
    return OpenAICompatProvider(req.provider, api_key, req.model)
