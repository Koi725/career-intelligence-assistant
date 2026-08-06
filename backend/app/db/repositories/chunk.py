import uuid

from sqlalchemy.orm import Session

from app.db.models import Chunk


class ChunkRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def create_many(self, chunks: list[dict]) -> list[Chunk]:
        records = [Chunk(**c) for c in chunks]
        self._db.add_all(records)
        self._db.flush()
        return records

    def count_for_source(self, source_type: str, source_id: uuid.UUID) -> int:
        return (
            self._db.query(Chunk)
            .filter(Chunk.source_type == source_type, Chunk.source_id == source_id)
            .count()
        )
