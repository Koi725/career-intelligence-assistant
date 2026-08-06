import logging

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


class ClaudeClient:
    def __init__(self) -> None:
        self._client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
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
