import uuid

from sqlalchemy.orm import Session

from app.db.models import Resume


class ResumeRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def create(self, filename: str, raw_text: str, pages: int, size_bytes: int) -> Resume:
        record = Resume(
            filename=filename,
            raw_text=raw_text,
            pages=pages,
            size_bytes=size_bytes,
        )
        self._db.add(record)
        self._db.flush()
        return record

    def get(self, resume_id: uuid.UUID) -> Resume | None:
        return self._db.get(Resume, resume_id)
