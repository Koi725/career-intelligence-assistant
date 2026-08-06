import tiktoken

from app.rag.chunker import Chunker


def test_overlap_preserved_between_adjacent_chunks():
    chunker = Chunker()
    # Seven paragraphs of ~100 tokens each → ~700 tokens, forces multiple chunks.
    para = "word " * 100
    pages = ["\n\n".join([para] * 7)]
    chunks = chunker.chunk_resume(pages)
    assert len(chunks) >= 2
    # The last tokens of chunk 0 must appear verbatim at the start of chunk 1.
    end_words = set(chunks[0]["content"].split()[-20:])
    start_words = chunks[1]["content"].split()[:20]
    assert any(w in end_words for w in start_words)


def test_token_counts_within_budget():
    enc = tiktoken.get_encoding("cl100k_base")
    chunker = Chunker()
    para = "the quick brown fox jumped over the lazy dog " * 30  # ~270 tokens
    pages = ["\n\n".join([para] * 5)]  # ~1350 tokens total
    chunks = chunker.chunk_resume(pages)
    for chunk in chunks:
        count = len(enc.encode(chunk["content"]))
        assert count <= Chunker.CHUNK_SIZE, f"chunk has {count} tokens, limit is {Chunker.CHUNK_SIZE}"


def test_page_and_section_numbers_in_metadata():
    chunker = Chunker()
    pages = ["Content from the first page.", "Content from the second page."]
    chunks = chunker.chunk_resume(pages)
    assert all("page" in c["meta"] for c in chunks)
    assert chunks[0]["meta"]["page"] == 1

    job_text = "Introduction.\n\nRequirements.\n\nBenefits."
    job_chunks = chunker.chunk_job(job_text)
    assert all("section" in c["meta"] for c in job_chunks)
    assert job_chunks[0]["meta"]["section"] == 1
    assert all("chunk_index" in c["meta"] and "total" in c["meta"] for c in job_chunks)


def test_empty_and_single_short_paragraph():
    chunker = Chunker()
    assert chunker.chunk_resume([]) == []
    assert chunker.chunk_resume([""]) == []
    assert chunker.chunk_resume(["   \n\n   "]) == []

    chunks = chunker.chunk_resume(["A short resume."])
    assert len(chunks) == 1
    assert chunks[0]["meta"]["chunk_index"] == 1
    assert chunks[0]["meta"]["total"] == 1

    job_chunks = chunker.chunk_job("A short job description.")
    assert len(job_chunks) == 1
    assert job_chunks[0]["meta"]["chunk_index"] == 1
