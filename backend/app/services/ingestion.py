import logging

from sqlalchemy.orm import Session

from app.db.repositories.chunk import ChunkRepository
from app.db.repositories.job import JobRepository
from app.db.repositories.resume import ResumeRepository
from app.llm.claude import ClaudeClient
from app.rag.chunker import Chunker
from app.rag.embedder import Embedder
from app.schemas.job import JobDoc
from app.schemas.resume import ResumeDoc

logger = logging.getLogger(__name__)


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

    def ingest_resume(self, filename: str, pages: list[str], size_bytes: int) -> ResumeDoc:
        raw_text = "\n\n".join(pages)
        chunks = self._chunker.chunk_resume(pages)
        embeddings = self._embedder.embed([c["content"] for c in chunks])

        resume = self._resume_repo.create(
            filename=filename,
            raw_text=raw_text,
            pages=len(pages),
            size_bytes=size_bytes,
        )
        self._chunk_repo.create_many(
            [
                {
                    "source_type": "resume",
                    "source_id": resume.id,
                    "content": c["content"],
                    "embedding": emb,
                    "meta": c["meta"],
                }
                for c, emb in zip(chunks, embeddings)
            ]
        )
        self._db.commit()

        return ResumeDoc(
            id=resume.id,
            filename=resume.filename,
            pages=resume.pages,
            chunks=len(chunks),
            size_kb=round(size_bytes / 1024, 1),
        )

    def ingest_job(self, text: str, source: str) -> JobDoc:
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
        self._chunk_repo.create_many(
            [
                {
                    "source_type": "job",
                    "source_id": job.id,
                    "content": c["content"],
                    "embedding": emb,
                    "meta": c["meta"],
                }
                for c, emb in zip(chunks, embeddings)
            ]
        )
        self._db.commit()

        return JobDoc(
            id=job.id,
            title=job.title,
            company=job.company,
            location=job.location,
            source=job.source,
            chunks=len(chunks),
        )

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
