import uuid
from typing import TypeVar

from app.db.repositories.chunk import ChunkRepository
from app.db.repositories.job import JobRepository
from app.rag.embedder import Embedder
from app.schemas.chat import Citation

_T = TypeVar("_T")


def _round_robin(lists: list[list[_T]]) -> list[_T]:
    result: list[_T] = []
    iters = [iter(lst) for lst in lists if lst]
    while iters:
        active = []
        for it in iters:
            try:
                result.append(next(it))
                active.append(it)
            except StopIteration:
                pass
        iters = active
    return result


class RetrievalService:
    def __init__(
        self,
        chunk_repo: ChunkRepository,
        job_repo: JobRepository,
        embedder: Embedder,
        floor: float,
    ) -> None:
        self._chunk_repo = chunk_repo
        self._job_repo = job_repo
        self._embedder = embedder
        self._floor = floor

    def retrieve(self, query: str, scope: str) -> tuple[list[Citation], list[str]]:
        query_embedding = self._embedder.embed([query])[0]
        all_jobs = self._job_repo.list_all()
        # list_all returns DESC (newest first); reverse for stable Job-N numbering.
        job_numbers: dict[uuid.UUID, int] = {
            job.id: i + 1 for i, job in enumerate(reversed(all_jobs))
        }

        if scope == "all":
            return self._retrieve_all(query_embedding, all_jobs, job_numbers)

        try:
            job_id = uuid.UUID(scope)
        except ValueError:
            return [], []

        target = next((j for j in all_jobs if j.id == job_id), None)
        if target is None:
            return [], []

        return self._retrieve_scoped(query_embedding, target, job_numbers)

    # ------------------------------------------------------------------
    # scope = "all": top-8 resume + top-3 per job, round-robined
    # ------------------------------------------------------------------

    def _retrieve_all(
        self,
        query_embedding: list[float],
        all_jobs: list,
        job_numbers: dict[uuid.UUID, int],
    ) -> tuple[list[Citation], list[str]]:
        resume_pairs = self._chunk_repo.search_by_type(query_embedding, "resume", limit=8)
        resume_citations = [
            self._to_citation(chunk, score, "Resume")
            for chunk, score in resume_pairs
            if score >= self._floor
        ]

        job_lists: list[list[Citation]] = []
        empty_sources: list[str] = []

        # Iterate jobs in ascending upload order so Job-1 is always the oldest.
        for job in reversed(all_jobs):
            kind = f"Job {job_numbers[job.id]}"
            pairs = self._chunk_repo.search_by_source(
                query_embedding, "job", job.id, limit=3
            )
            passed = [
                self._to_citation(chunk, score, kind)
                for chunk, score in pairs
                if score >= self._floor
            ]
            if passed:
                job_lists.append(passed)
            else:
                empty_sources.append(kind)

        job_citations = _round_robin(job_lists)
        return resume_citations + job_citations, empty_sources

    # ------------------------------------------------------------------
    # scope = <job_id>: top-6 resume + top-6 from that job
    # ------------------------------------------------------------------

    def _retrieve_scoped(
        self,
        query_embedding: list[float],
        job,
        job_numbers: dict[uuid.UUID, int],
    ) -> tuple[list[Citation], list[str]]:
        resume_pairs = self._chunk_repo.search_by_type(query_embedding, "resume", limit=6)
        resume_citations = [
            self._to_citation(chunk, score, "Resume")
            for chunk, score in resume_pairs
            if score >= self._floor
        ]

        kind = f"Job {job_numbers[job.id]}"
        job_pairs = self._chunk_repo.search_by_source(
            query_embedding, "job", job.id, limit=6
        )
        job_citations = [
            self._to_citation(chunk, score, kind)
            for chunk, score in job_pairs
            if score >= self._floor
        ]

        empty_sources = [] if job_citations else [kind]
        return resume_citations + job_citations, empty_sources

    # ------------------------------------------------------------------

    def _to_citation(self, chunk, score: float, kind: str) -> Citation:
        meta = chunk.meta
        index = meta.get("chunk_index", "?")
        total = meta.get("total", "?")

        if chunk.source_type == "resume":
            locator = f"Page {meta.get('page', '?')} · chunk {index} of {total}"
        else:
            locator = f"Section {meta.get('section', '?')} · chunk {index} of {total}"

        return Citation(
            id=str(chunk.id),
            kind=kind,
            label=meta.get("label", " ".join(chunk.content.split()[:6])),
            score=round(score, 4),
            locator=locator,
            chunk=chunk.content,
        )
