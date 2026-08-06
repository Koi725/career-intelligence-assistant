import uuid

from app.schemas.job import JobDoc
from app.schemas.resume import ResumeDoc


def test_resume_doc_serialises_to_camel_case():
    doc = ResumeDoc(
        id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        filename="Alex_Morgan_Resume_2026.pdf",
        pages=3,
        chunks=42,
        size_kb=218.0,
    )
    data = doc.model_dump(by_alias=True)
    assert set(data.keys()) == {"id", "filename", "pages", "chunks", "sizeKb"}
    assert data["sizeKb"] == 218.0
    assert data["filename"] == "Alex_Morgan_Resume_2026.pdf"


def test_job_doc_serialises_to_camel_case():
    doc = JobDoc(
        id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
        title="Senior Frontend Engineer",
        company="Stripe",
        location="Remote (US)",
        source="paste",
        chunks=18,
    )
    data = doc.model_dump(by_alias=True)
    assert set(data.keys()) == {"id", "title", "company", "location", "source", "chunks"}
    assert data["source"] == "paste"
    assert data["company"] == "Stripe"
