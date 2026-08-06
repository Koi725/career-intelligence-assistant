"""Route contract tests — no network, no live LLM, no real database."""
import json
from collections.abc import AsyncGenerator
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.main import app
from app.schemas.chat import Citation
from app.services.chat import ChatService
from app.services.ingestion import IngestionService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class _FakeEmbedder:
    def embed(self, texts: list[str]) -> list[list[float]]:
        return [[0.0] * 384 for _ in texts]


def _ingestion_service_factory(*, raise_on_ingest=None):
    """Return a real IngestionService with all collaborators mocked out."""
    svc = IngestionService(
        db=MagicMock(),
        resume_repo=MagicMock(),
        job_repo=MagicMock(),
        chunk_repo=MagicMock(),
        chunker=MagicMock(),
        embedder=_FakeEmbedder(),
        claude=MagicMock(),
    )
    if raise_on_ingest:
        svc.ingest_resume = MagicMock(side_effect=raise_on_ingest)
    return svc


_FAKE_CITATION = Citation(
    id="abc",
    kind="Resume",
    label="Skills",
    score=0.9,
    locator="Page 1 · chunk 1 of 1",
    chunk="Python engineer.",
)

_SSE_DONE_FOOTER = {
    "latencySeconds": 0.5,
    "tokens": 15,
    "costDollars": 0.0001,
    "model": "claude-sonnet",
    "chunks": 1,
    "truncated": False,
}


async def _fake_chat_stream(
    request, request_id  # noqa: ARG001
) -> AsyncGenerator[str, None]:
    yield f"data: {json.dumps({'type': 'sources', 'citations': [_FAKE_CITATION.model_dump(by_alias=True)]})}\n\n"
    yield f"data: {json.dumps({'type': 'delta', 'text': 'Hello'})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'sections': [], 'footer': _SSE_DONE_FOOTER})}\n\n"


def _make_chat_service(*, has_resume: bool = True) -> ChatService:
    svc = MagicMock(spec=ChatService)
    svc.check_prerequisites = MagicMock(
        side_effect=None if has_resume else _no_resume_side_effect
    )
    svc.check_rate_limits = MagicMock()
    svc.chat_stream = _fake_chat_stream
    return svc


def _no_resume_side_effect():
    from app.core.errors import NoResumeUploaded
    raise NoResumeUploaded(
        "Upload a resume before chatting — the assistant has nothing to compare against."
    )


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture
def client_with_chat(request):
    """TestClient with chat service overridden; parametrize has_resume via marks."""
    has_resume = getattr(request, "param", True)
    app.dependency_overrides[deps.get_chat_service] = lambda: _make_chat_service(
        has_resume=has_resume
    )
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.pop(deps.get_chat_service, None)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_resume_upload_wrong_content_type_returns_415(client):
    """A non-PDF upload is rejected with 415 Unsupported Media Type."""
    app.dependency_overrides[deps.get_ingestion_service] = _ingestion_service_factory
    try:
        response = client.post(
            "/api/resume",
            files={"file": ("resume.txt", b"text content", "text/plain")},
        )
    finally:
        app.dependency_overrides.pop(deps.get_ingestion_service, None)

    assert response.status_code == 415
    assert "PDF" in response.json()["detail"]


def test_resume_upload_oversized_returns_413(client):
    """A PDF exceeding the size cap is rejected with 413 Content Too Large."""
    app.dependency_overrides[deps.get_ingestion_service] = _ingestion_service_factory
    try:
        response = client.post(
            "/api/resume",
            files={"file": ("big.pdf", b"x" * (5 * 1024 * 1024 + 1), "application/pdf")},
        )
    finally:
        app.dependency_overrides.pop(deps.get_ingestion_service, None)

    assert response.status_code == 413
    assert "limit" in response.json()["detail"].lower()


@pytest.mark.parametrize("client_with_chat", [False], indirect=True)
def test_chat_before_resume_returns_400(client_with_chat):
    """Chatting before a resume is uploaded returns 400 with an actionable message."""
    response = client_with_chat.post(
        "/api/chat",
        json={"message": "Am I a good fit?", "scope": "all"},
    )
    assert response.status_code == 400
    assert "resume" in response.json()["detail"].lower()


@pytest.mark.parametrize("client_with_chat", [True], indirect=True)
def test_chat_sse_event_sequence(client_with_chat):
    """SSE stream delivers sources → delta(s) → done in that order."""
    with client_with_chat.stream(
        "POST",
        "/api/chat",
        json={"message": "How do I fit?", "scope": "all"},
    ) as response:
        assert response.status_code == 200
        raw_lines = [
            line for line in response.iter_lines() if line.startswith("data:")
        ]

    events = [json.loads(line[len("data: "):]) for line in raw_lines]
    types = [e["type"] for e in events]

    assert types[0] == "sources"
    assert types[-1] == "done"
    assert all(t == "delta" for t in types[1:-1])
    assert len(events[0]["citations"]) == 1
    assert "footer" in events[-1]
