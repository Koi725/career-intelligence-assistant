import uuid

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.api.deps import get_chat_service
from app.schemas.chat import ChatRequest
from app.services.chat import ChatService

router = APIRouter()


@router.post("/api/chat")
async def chat(
    http_request: Request,
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    # Prerequisites and rate limits run before StreamingResponse is created so
    # domain errors still produce proper HTTP status codes (400, 429), not a
    # partially-started stream.
    service.check_prerequisites()
    service.check_rate_limits()

    request_id = getattr(http_request.state, "request_id", f"req_{uuid.uuid4().hex[:8]}")
    return StreamingResponse(
        service.chat_stream(request, request_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
