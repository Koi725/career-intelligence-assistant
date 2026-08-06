import tiktoken

from app.rag.prompts import _CONTEXT_BUDGET, assemble_context
from app.schemas.chat import Citation


def _make_citation(kind: str = "Resume", score: float = 0.8, label: str = "Test", text: str = "content") -> Citation:
    return Citation(
        id="00000000-0000-0000-0000-000000000001",
        kind=kind,
        label=label,
        score=score,
        locator="Page 1 · chunk 1 of 1",
        chunk=text,
    )


def test_context_stays_within_token_budget():
    """Lowest-scoring chunks are dropped when the budget is exceeded."""
    enc = tiktoken.get_encoding("cl100k_base")
    # Each citation has ~150 tokens; 50 of them easily exceeds 6000.
    many = [
        _make_citation(score=float(i) / 100, text="word " * 120)
        for i in range(50)
    ]
    result = assemble_context(many, [])
    token_count = len(enc.encode(result))
    assert token_count <= _CONTEXT_BUDGET, f"Context is {token_count} tokens, budget is {_CONTEXT_BUDGET}"


def test_every_chunk_block_carries_source_label():
    """Each block must be prefixed with kind and label so the model can cite it."""
    citations = [
        _make_citation(kind="Resume", label="Experience — Fathom"),
        _make_citation(kind="Job 2", label="Responsibilities — ownership"),
    ]
    result = assemble_context(citations, [])
    assert "Resume" in result
    assert "Experience — Fathom" in result
    assert "Job 2" in result
    assert "Responsibilities — ownership" in result


def test_empty_sources_noted_explicitly():
    """Sources that returned nothing must appear as a named notice in the context."""
    result = assemble_context([], ["Job 3"])
    assert "Job 3" in result
    assert "NO PASSAGES FOUND" in result
