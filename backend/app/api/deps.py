from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.repositories.chunk import ChunkRepository
from app.db.repositories.job import JobRepository
from app.db.repositories.resume import ResumeRepository
from app.db.session import get_db
from app.llm.claude import ClaudeClient
from app.rag.chunker import Chunker
from app.rag.embedder import OpenAIEmbedder
from app.services.ingestion import IngestionService

_chunker = Chunker()


def get_ingestion_service(db: Session = Depends(get_db)) -> IngestionService:
    return IngestionService(
        db=db,
        resume_repo=ResumeRepository(db),
        job_repo=JobRepository(db),
        chunk_repo=ChunkRepository(db),
        chunker=_chunker,
        embedder=OpenAIEmbedder(),
        claude=ClaudeClient(),
    )
