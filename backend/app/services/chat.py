import asyncio
import json
import logging
import time
import uuid
from collections.abc import AsyncGenerator

from app.config import settings
from app.core.errors import DailyTokenLimitExceeded, DomainError, NoResumeUploaded
from app.core.metrics import collector
from app.db.repositories.resume import ResumeRepository
from app.llm.claude import ClaudeClient, _format_model, compute_cost
from app.rag.parser import parse_markdown
from app.rag.prompts import assemble_context, build_system_prompt
from app.schemas.chat import ChatRequest, ExchangeFooter
from app.services.retrieval import RetrievalService

logger = logging.getLogger(__name__)


def _sse(event_type: str, payload: dict) -> str:
    return f"data: {json.dumps({'type': event_type, **payload})}\n\n"


class ChatService:
    def __init__(
        self,
        retrieval: RetrievalService,
        claude: ClaudeClient,
        resume_repo: ResumeRepository,
    ) -> None:
        self._retrieval = retrieval
        self._claude = claude
        self._resume_repo = resume_repo

    def check_prerequisites(self) -> None:
        if not self._resume_repo.has_any():
            raise NoResumeUploaded(
                "Upload a resume before chatting — "
                "the assistant has nothing to compare against."
            )

    def check_rate_limits(self) -> None:
        if collector.daily_tokens_today() >= settings.DAILY_TOKEN_BUDGET:
            raise DailyTokenLimitExceeded(
                "Daily token budget reached — try again tomorrow."
            )

    async def chat_stream(
        self, request: ChatRequest, request_id: str
    ) -> AsyncGenerator[str, None]:
        start = time.monotonic()

        try:
            query = self._build_retrieval_query(request)

            retrieve_start = time.monotonic()
            citations, empty_sources = await asyncio.to_thread(
                self._retrieval.retrieve, query, request.scope
            )
            retrieve_ms = (time.monotonic() - retrieve_start) * 1000

            yield _sse("sources", {"citations": [c.model_dump(by_alias=True) for c in citations]})

            context = assemble_context(citations, empty_sources)
            system = build_system_prompt(context)
            messages = self._build_messages(request)

            full_text = ""
            ttft_ms: float | None = None
            input_tokens = 0
            output_tokens = 0
            truncated = False
            model_name = ""

            async for event_type, data in self._claude.stream_answer(system, messages):
                if event_type == "delta":
                    if ttft_ms is None:
                        ttft_ms = (time.monotonic() - start) * 1000
                    full_text += data["text"]
                    yield _sse("delta", {"text": data["text"]})

                elif event_type == "done":
                    usage = data["usage"]
                    input_tokens = usage.input_tokens
                    output_tokens = usage.output_tokens
                    truncated = data.get("stop_reason") == "max_tokens"
                    model_name = data["model"]

                    cost = compute_cost(model_name, input_tokens, output_tokens)
                    total_ms = (time.monotonic() - start) * 1000

                    footer = ExchangeFooter(
                        latency_seconds=round(total_ms / 1000, 2),
                        tokens=input_tokens + output_tokens,
                        cost_dollars=cost,
                        model=_format_model(model_name),
                        chunks=len(citations),
                        truncated=truncated,
                    )
                    sections = parse_markdown(full_text)
                    yield _sse(
                        "done",
                        {
                            "sections": [s.model_dump(by_alias=True) for s in sections],
                            "footer": footer.model_dump(by_alias=True),
                        },
                    )

                    scores = [c.score for c in citations]
                    logger.info(
                        "rag.query",
                        extra={
                            "request_id": request_id,
                            "scope": request.scope,
                            "n_chunks": len(citations),
                            "top_score": round(max(scores), 4) if scores else None,
                            "min_score": round(min(scores), 4) if scores else None,
                            "retrieve_ms": round(retrieve_ms, 1),
                            "ttft_ms": round(ttft_ms or 0, 1),
                            "total_ms": round(total_ms, 1),
                            "input_tokens": input_tokens,
                            "output_tokens": output_tokens,
                            "usd_cost": cost,
                            "truncated": truncated,
                        },
                    )

                    collector.record(
                        latency_seconds=total_ms / 1000,
                        tokens=input_tokens + output_tokens,
                        cost=cost,
                    )

        except DomainError:
            raise
        except Exception:
            logger.exception("chat stream error", extra={"request_id": request_id})
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
