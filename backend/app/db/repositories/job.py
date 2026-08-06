from sqlalchemy.orm import Session

from app.db.models import Job


class JobRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def create(
        self, title: str, company: str, location: str, source: str, raw_text: str
    ) -> Job:
        record = Job(
            title=title,
            company=company,
            location=location,
            source=source,
            raw_text=raw_text,
        )
        self._db.add(record)
        self._db.flush()
        return record

    def list_all(self) -> list[Job]:
        return self._db.query(Job).order_by(Job.uploaded_at.desc()).all()
