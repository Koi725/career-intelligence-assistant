from fastapi import Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.db.repositories.chunk import ChunkRepository
from app.db.repositories.job import JobRepository
from app.db.repositories.resume import ResumeRepository
from app.db.session import get_db
from app.llm.claude import ClaudeClient
from app.rag.chunker import Chunker
from app.rag.embedder import LocalEmbedder
from app.services.chat import ChatService
from app.services.ingestion import IngestionService
from app.services.retrieval import RetrievalService

# Singletons: model and tokenizer load once at startup, not per request.
_chunker = Chunker()
_embedder = LocalEmbedder()


def get_ingestion_service(db: Session = Depends(get_db)) -> IngestionService:
    return IngestionService(
        db=db,
        resume_repo=ResumeRepository(db),
        job_repo=JobRepository(db),
        chunk_repo=ChunkRepository(db),
        chunker=_chunker,
        embedder=_embedder,
        claude=ClaudeClient(),
    )


def get_chat_service(db: Session = Depends(get_db)) -> ChatService:
    retrieval = RetrievalService(
        chunk_repo=ChunkRepository(db),
        job_repo=JobRepository(db),
        embedder=_embedder,
        floor=settings.SIMILARITY_THRESHOLD,
    )
    return ChatService(retrieval=retrieval, claude=ClaudeClient())
