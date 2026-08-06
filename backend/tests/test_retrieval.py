"""
Retrieval tests — no database, no network.
ChunkRepository and JobRepository are replaced with fakes.
"""
import uuid
from unittest.mock import MagicMock

import pytest

from app.services.retrieval import RetrievalService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class _FakeEmbedder:
    def embed(self, texts: list[str]) -> list[list[float]]:
        return [[0.0] * 1536 for _ in texts]


def _make_chunk(source_type: str = "resume", source_id: uuid.UUID | None = None) -> MagicMock:
    chunk = MagicMock()
    chunk.id = uuid.uuid4()
    chunk.source_type = source_type
    chunk.source_id = source_id or uuid.uuid4()
    chunk.content = "sample content"
    chunk.meta = {"page": 1, "chunk_index": 1, "total": 1, "label": "Test Heading"}
    return chunk


def _make_job(uploaded_at_offset: int = 0) -> MagicMock:
    from datetime import datetime, timedelta
    job = MagicMock()
    job.id = uuid.uuid4()
    job.uploaded_at = datetime(2026, 1, 1) + timedelta(days=uploaded_at_offset)
    return job


def _make_service(
    resume_results: list,
    job_results_by_id: dict | None = None,
    jobs: list | None = None,
    floor: float = 0.3,
) -> RetrievalService:
    mock_chunk_repo = MagicMock()
    mock_chunk_repo.search_by_type.return_value = resume_results

    job_results_by_id = job_results_by_id or {}

    def _search_by_source(emb, source_type, source_id, limit):
        return job_results_by_id.get(source_id, [])[:limit]

    mock_chunk_repo.search_by_source.side_effect = _search_by_source

    mock_job_repo = MagicMock()
    mock_job_repo.list_all.return_value = jobs or []

    return RetrievalService(
        chunk_repo=mock_chunk_repo,
        job_repo=mock_job_repo,
        embedder=_FakeEmbedder(),
        floor=floor,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_floor_excludes_low_similarity_chunks():
    """
    <=> is cosine DISTANCE (low = similar). Similarity = 1 - distance.
    The floor is compared against SIMILARITY, not distance.
    Getting this backwards keeps the worst chunks and looks plausible in output.
    High-similarity chunks (score > floor) must be kept; low-similarity dropped.
    """
    near = _make_chunk("resume")
    far = _make_chunk("resume")

    service = _make_service(
        resume_results=[(near, 0.85), (far, 0.10)],
        floor=0.3,
    )
    citations, _ = service.retrieve("query", "all")

    scores = [c.score for c in citations]
    assert all(s >= 0.3 for s in scores), f"Low-score chunk leaked through: {scores}"
    assert any(abs(s - 0.85) < 0.01 for s in scores), "High-score chunk was wrongly excluded"
    assert not any(abs(s - 0.10) < 0.01 for s in scores), "Low-score chunk should be absent"


def test_per_source_budgets_hold():
    """Job chunks are capped at 3 per job in 'all' scope regardless of how many match."""
    job1 = _make_job(0)
    job2 = _make_job(1)
    # Both jobs have 3 matching chunks (the limit the service requests)
    j1_chunks = [(c, 0.9) for c in [_make_chunk("job", job1.id) for _ in range(3)]]
    j2_chunks = [(c, 0.8) for c in [_make_chunk("job", job2.id) for _ in range(3)]]
    resume_chunks = [(c, 0.75) for c in [_make_chunk("resume") for _ in range(8)]]

    service = _make_service(
        resume_results=resume_chunks,
        job_results_by_id={job1.id: j1_chunks, job2.id: j2_chunks},
        jobs=[job2, job1],  # list_all returns DESC (newest first)
        floor=0.1,
    )
    citations, _ = service.retrieve("query", "all")

    job1_count = sum(1 for c in citations if c.kind == "Job 1")
    job2_count = sum(1 for c in citations if c.kind == "Job 2")
    resume_count = sum(1 for c in citations if c.kind == "Resume")

    assert job1_count <= 3
    assert job2_count <= 3
    assert resume_count <= 8


def test_all_scope_round_robins_jobs():
    """
    Chunks from multiple jobs are interleaved (J1, J2, J1, J2…),
    not stacked (J1, J1, J1, J2, J2, J2). This ensures one verbose
    job cannot crowd out another in the context window.
    """
    job1 = _make_job(0)
    job2 = _make_job(1)

    j1_chunks = [(c, 0.9) for c in [_make_chunk("job", job1.id) for _ in range(3)]]
    j2_chunks = [(c, 0.8) for c in [_make_chunk("job", job2.id) for _ in range(3)]]

    service = _make_service(
        resume_results=[],
        job_results_by_id={job1.id: j1_chunks, job2.id: j2_chunks},
        jobs=[job2, job1],
        floor=0.1,
    )
    citations, _ = service.retrieve("query", "all")
    job_kinds = [c.kind for c in citations]

    # Consecutive entries must alternate between Job 1 and Job 2.
    for i in range(len(job_kinds) - 1):
        assert job_kinds[i] != job_kinds[i + 1], (
            f"Expected alternation at index {i}: {job_kinds}"
        )


def test_empty_job_reported_in_empty_sources():
    """When a job returns nothing above the floor, its name appears in empty_sources."""
    job = _make_job()
    service = _make_service(
        resume_results=[],
        job_results_by_id={job.id: [(c, 0.05) for c in [_make_chunk("job", job.id)]]},
        jobs=[job],
        floor=0.3,
    )
    _, empty_sources = service.retrieve("query", "all")
    assert len(empty_sources) == 1
    assert empty_sources[0].startswith("Job ")
