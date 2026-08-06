import io
import logging
import uuid

from pypdf import PdfReader
from sqlalchemy.orm import Session

from app.core.errors import EmptyDocument, FileTooLarge, JobNotFound, TooManyPages, UnsupportedFileType
from app.db.repositories.chunk import ChunkRepository
from app.db.repositories.job import JobRepository
from app.db.repositories.resume import ResumeRepository
from app.llm.claude import ClaudeClient
from app.rag.chunker import Chunker
from app.rag.embedder import Embedder
from app.schemas.job import JobDoc
from app.schemas.resume import ResumeDoc

logger = logging.getLogger(__name__)

_MAX_BYTES = 5 * 1024 * 1024
_MAX_PAGES = 20
_PDF_CONTENT_TYPE = "application/pdf"


class IngestionService:
    def __init__(
        self,
        db: Session,
        resume_repo: ResumeRepository,
        job_repo: JobRepository,
        chunk_repo: ChunkRepository,
        chunker: Chunker,
        embedder: Embedder,
        claude: ClaudeClient,
    ) -> None:
        self._db = db
        self._resume_repo = resume_repo
        self._job_repo = job_repo
        self._chunk_repo = chunk_repo
        self._chunker = chunker
        self._embedder = embedder
        self._claude = claude

    def ingest_resume(self, data: bytes, filename: str, content_type: str) -> ResumeDoc:
        self._validate_pdf(data, content_type)
        reader = PdfReader(io.BytesIO(data))
        if len(reader.pages) > _MAX_PAGES:
            raise TooManyPages(
                f"PDF has {len(reader.pages)} pages — the limit is {_MAX_PAGES}. "
                "Try splitting the file."
            )
        pages = [page.extract_text() or "" for page in reader.pages]
        if not any(p.strip() for p in pages):
            raise EmptyDocument(
                "PDF contains no extractable text — try a text-based PDF rather than a scan."
            )

        raw_text = "\n\n".join(pages)
        chunks = self._chunker.chunk_resume(pages)
        embeddings = self._embedder.embed([c["content"] for c in chunks])

        resume = self._resume_repo.create(
            filename=filename,
            raw_text=raw_text,
            pages=len(pages),
            size_bytes=len(data),
        )
        self._chunk_repo.create_many([
            {
                "source_type": "resume",
                "source_id": resume.id,
                "content": c["content"],
                "embedding": emb,
                "meta": c["meta"],
            }
            for c, emb in zip(chunks, embeddings)
        ])
        self._db.commit()

        return ResumeDoc(
            id=resume.id,
            filename=resume.filename,
            pages=resume.pages,
            chunks=len(chunks),
            size_kb=round(len(data) / 1024, 1),
        )

    def ingest_job_text(self, text: str) -> JobDoc:
        if not text.strip():
            raise EmptyDocument(
                "Job description is empty — paste the full job posting to continue."
            )
        return self._ingest_job(text=text, source="paste")

    def ingest_job_file(self, data: bytes, filename: str, content_type: str) -> JobDoc:
        self._validate_pdf(data, content_type)
        reader = PdfReader(io.BytesIO(data))
        if len(reader.pages) > _MAX_PAGES:
            raise TooManyPages(
                f"PDF has {len(reader.pages)} pages — the limit is {_MAX_PAGES}. "
                "Try splitting the file."
            )
        pages = [page.extract_text() or "" for page in reader.pages]
        if not any(p.strip() for p in pages):
            raise EmptyDocument(
                "PDF contains no extractable text — try a text-based PDF rather than a scan."
            )
        return self._ingest_job(text="\n\n".join(pages), source="pdf")

    def delete_job(self, job_id: uuid.UUID) -> None:
        self._chunk_repo.delete_for_source("job", job_id)
        if not self._job_repo.delete(job_id):
            raise JobNotFound(f"Job {job_id} not found.")
        self._db.commit()

    def list_jobs(self) -> list[JobDoc]:
        jobs = self._job_repo.list_all()
        return [
            JobDoc(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                source=job.source,
                chunks=self._chunk_repo.count_for_source("job", job.id),
            )
            for job in jobs
        ]

    # ------------------------------------------------------------------

    def _validate_pdf(self, data: bytes, content_type: str) -> None:
        if content_type != _PDF_CONTENT_TYPE:
            raise UnsupportedFileType(
                f"Only PDF files are accepted — received '{content_type or 'unknown'}'. "
                "Re-upload as a PDF."
            )
        if len(data) > _MAX_BYTES:
            raise FileTooLarge(
                f"File exceeds the {_MAX_BYTES // (1024 * 1024)} MB limit — "
                "compress or trim the PDF and try again."
            )

    def _ingest_job(self, text: str, source: str) -> JobDoc:
        fields = self._claude.extract_job_fields(text)
        chunks = self._chunker.chunk_job(text)
        embeddings = self._embedder.embed([c["content"] for c in chunks])

        job = self._job_repo.create(
            title=fields.get("title", ""),
            company=fields.get("company", ""),
            location=fields.get("location", ""),
            source=source,
            raw_text=text,
        )
        self._chunk_repo.create_many([
            {
                "source_type": "job",
                "source_id": job.id,
                "content": c["content"],
                "embedding": emb,
                "meta": c["meta"],
            }
            for c, emb in zip(chunks, embeddings)
        ])
        self._db.commit()

        return JobDoc(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            source=job.source,
            chunks=len(chunks),
        )
