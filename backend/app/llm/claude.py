import logging
from collections.abc import AsyncGenerator

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

_EXTRACT_TOOL = {
    "name": "record_job_fields",
    "description": "Record the title, company, and location extracted from a job description.",
    "input_schema": {
        "type": "object",
        "properties": {
            "title": {"type": "string", "description": "Job title"},
            "company": {"type": "string", "description": "Company name"},
            "location": {"type": "string", "description": "Work location or remote policy"},
        },
        "required": ["title", "company", "location"],
    },
}

_EXTRACT_PROMPT = (
    "Extract the job title, company name, and work location from the job description below. "
    "Use an empty string for any field not mentioned."
)

# Approximate pricing per 1M tokens — check Anthropic pricing page; these may be stale.
_COST_PER_M: dict[str, tuple[float, float]] = {
    "claude-sonnet": (3.0, 15.0),
    "claude-opus": (15.0, 75.0),
    "claude-haiku": (0.25, 1.25),
}


def _format_model(model_id: str) -> str:
    parts = model_id.split("-")
    for i, part in enumerate(parts):
        if part.isdigit():
            return "-".join(parts[:i])
    return model_id


def compute_cost(model_id: str, input_tokens: int, output_tokens: int) -> float:
    short = _format_model(model_id)
    family = next((k for k in _COST_PER_M if k in short), "claude-sonnet")
    in_rate, out_rate = _COST_PER_M[family]
    return round((input_tokens * in_rate + output_tokens * out_rate) / 1_000_000, 4)


class ClaudeClient:
    def __init__(self) -> None:
        self._client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        self._async_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self._model = settings.ANTHROPIC_MODEL

    def extract_job_fields(self, text: str) -> dict[str, str]:
        try:
            response = self._client.messages.create(
                model=self._model,
                max_tokens=256,
                tools=[_EXTRACT_TOOL],
                tool_choice={"type": "tool", "name": "record_job_fields"},
                messages=[
                    {
                        "role": "user",
                        "content": f"{_EXTRACT_PROMPT}\n\n{text[:4000]}",
                    }
                ],
            )
            for block in response.content:
                if block.type == "tool_use" and block.name == "record_job_fields":
                    return block.input
        except Exception:
            logger.warning("Job field extraction failed; falling back to first non-empty line as title")

        first_line = next((line.strip() for line in text.splitlines() if line.strip()), "")
        return {"title": first_line, "company": "", "location": ""}

    async def stream_answer(
        self, system: str, messages: list[dict]
    ) -> AsyncGenerator[tuple[str, dict], None]:
        async with self._async_client.messages.stream(
            model=self._model,
            max_tokens=2048,
            system=system,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield ("delta", {"text": text})

            final = await stream.get_final_message()
            yield (
                "done",
                {
                    "usage": final.usage,
                    "model": final.model,
                },
            )
