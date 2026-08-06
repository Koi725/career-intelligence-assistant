import uuid

from sqlalchemy import Float, select
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
    ) -> list[tuple]:
        # <=> is cosine DISTANCE — ORDER BY ASC returns most-similar chunks first.
        # We return similarity = 1 - distance; the floor is applied by the caller
        # so tests can verify the filtering logic without a real database.
        #
        # Table columns (Chunk.__table__.c) bypass the ORM entity loader, which
        # silently applies the Vector type processor to the float distance column
        # when ORM-mapped descriptors (Chunk.embedding etc.) are mixed with a
        # scalar expression in the same select().
        t = Chunk.__table__.c
        # return_type=Float tells SQLAlchemy the <=> distance expression is a float,
        # not a Vector — without it the Vector result processor is applied to the
        # distance value and crashes.
        dist = t.embedding.op("<=>", return_type=Float)(query_embedding)
        rows = self._db.execute(
            select(t.id, t.content, t.meta, t.source_type, t.source_id, dist.label("dist"))
            .where(t.source_type == source_type, t.source_id == source_id)
            .order_by(dist.asc())
            .limit(limit)
        ).fetchall()
        return [(row, 1.0 - float(row.dist)) for row in rows]

    def search_by_type(
        self,
        query_embedding: list[float],
        source_type: str,
        limit: int,
    ) -> list[tuple]:
        t = Chunk.__table__.c
        # return_type=Float tells SQLAlchemy the <=> distance expression is a float,
        # not a Vector — without it the Vector result processor is applied to the
        # distance value and crashes.
        dist = t.embedding.op("<=>", return_type=Float)(query_embedding)
        rows = self._db.execute(
            select(t.id, t.content, t.meta, t.source_type, t.source_id, dist.label("dist"))
            .where(t.source_type == source_type)
            .order_by(dist.asc())
            .limit(limit)
        ).fetchall()
        return [(row, 1.0 - float(row.dist)) for row in rows]
