import asyncio
import json
import time
import uuid
import logging
from collections.abc import AsyncGenerator

from app.llm.claude import ClaudeClient, compute_cost, _format_model
from app.rag.parser import parse_markdown
from app.rag.prompts import assemble_context, build_system_prompt
from app.schemas.chat import ChatRequest, ExchangeFooter
from app.services.retrieval import RetrievalService

logger = logging.getLogger(__name__)


def _sse(event_type: str, payload: dict) -> str:
    return f"data: {json.dumps({'type': event_type, **payload})}\n\n"


class ChatService:
    def __init__(self, retrieval: RetrievalService, claude: ClaudeClient) -> None:
        self._retrieval = retrieval
        self._claude = claude

    async def chat_stream(self, request: ChatRequest) -> AsyncGenerator[str, None]:
        request_id = f"req_{uuid.uuid4().hex[:8]}"
        start = time.monotonic()

        try:
            query = self._build_retrieval_query(request)
            citations, empty_sources = await asyncio.to_thread(
                self._retrieval.retrieve, query, request.scope
            )

            yield _sse("sources", {"citations": [c.model_dump(by_alias=True) for c in citations]})

            context = assemble_context(citations, empty_sources)
            system = build_system_prompt(context)
            messages = self._build_messages(request)

            full_text = ""
            async for event_type, data in self._claude.stream_answer(system, messages):
                if event_type == "delta":
                    full_text += data["text"]
                    yield _sse("delta", {"text": data["text"]})

                elif event_type == "done":
                    usage = data["usage"]
                    footer = ExchangeFooter(
                        latency_seconds=round(time.monotonic() - start, 2),
                        tokens=usage.input_tokens + usage.output_tokens,
                        cost_dollars=compute_cost(
                            data["model"], usage.input_tokens, usage.output_tokens
                        ),
                        model=_format_model(data["model"]),
                        chunks=len(citations),
                    )
                    sections = parse_markdown(full_text)
                    yield _sse(
                        "done",
                        {
                            "sections": [s.model_dump(by_alias=True) for s in sections],
                            "footer": footer.model_dump(by_alias=True),
                        },
                    )

        except Exception:
            logger.exception("Chat stream error (requestId=%s)", request_id)
            yield _sse("error", {"code": "InternalError", "requestId": request_id})

    def _build_retrieval_query(self, request: ChatRequest) -> str:
        last_user = next(
            (m.get("content", "") for m in reversed(request.history) if m.get("role") == "user"),
            "",
        )
        if last_user and last_user != request.message:
            return f"{last_user}\n{request.message}"
        return request.message

    def _build_messages(self, request: ChatRequest) -> list[dict]:
        return [*request.history, {"role": "user", "content": request.message}]
