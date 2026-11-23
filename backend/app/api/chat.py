import json

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest
from app.services.llm.base import LLMError
from app.services.llm.factory import get_provider
from app.services.llm.prompt import build_system_prompt

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(req: ChatRequest, x_llm_key: str | None = Header(default=None)):
    """SSE stream. BYOK key comes in a header so it never lands in request-body logs."""
    try:
        provider = get_provider(req, x_llm_key)
    except LLMError as e:
        raise HTTPException(400, str(e))

    messages = [{"role": "system", "content": build_system_prompt(req.context)}]
    messages += [m.model_dump() for m in req.messages]

    async def gen():
        try:
            async for tok in provider.stream(messages):
                yield f"data: {json.dumps({'token': tok})}\n\n"
            yield "data: [DONE]\n\n"
        except LLMError as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
