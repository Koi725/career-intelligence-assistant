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

    def search_by_source(
        self,
        query_embedding: list[float],
        source_type: str,
        source_id: uuid.UUID,
        limit: int,
    ) -> list[tuple[Chunk, float]]:
        # <=> is cosine DISTANCE — ORDER BY ASC returns most-similar chunks first.
        # We return similarity = 1 - distance; the floor is applied by the caller
        # so tests can verify the filtering logic without a real database.
        dist = Chunk.embedding.op("<=>")(query_embedding)
        rows = (
            self._db.query(Chunk, dist.label("dist"))
            .filter(Chunk.source_type == source_type, Chunk.source_id == source_id)
            .order_by(dist.asc())
            .limit(limit)
            .all()
        )
        return [(chunk, 1.0 - float(d)) for chunk, d in rows]

    def search_by_type(
        self,
        query_embedding: list[float],
        source_type: str,
        limit: int,
    ) -> list[tuple[Chunk, float]]:
        dist = Chunk.embedding.op("<=>")(query_embedding)
        rows = (
            self._db.query(Chunk, dist.label("dist"))
            .filter(Chunk.source_type == source_type)
            .order_by(dist.asc())
            .limit(limit)
            .all()
        )
        return [(chunk, 1.0 - float(d)) for chunk, d in rows]
