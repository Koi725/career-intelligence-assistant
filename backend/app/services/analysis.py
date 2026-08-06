import asyncio
import logging
import time

from app.config import settings
from app.core.errors import DailyTokenLimitExceeded, NoResumeUploaded
from app.core.metrics import collector
from app.db.models import Job
from app.db.repositories.job import JobRepository
from app.db.repositories.resume import ResumeRepository
from app.llm.claude import ClaudeClient, compute_cost
from app.rag.prompts import assemble_context
from app.schemas.analysis import FitAxis, FitCard
from app.services.retrieval import RetrievalService

logger = logging.getLogger(__name__)

_WEIGHTS = {"technical": 0.3, "experience": 0.3, "seniority": 0.2, "domain": 0.2}

_AXIS_LABELS = [
    ("Technical", "technical"),
    ("Experience", "experience"),
    ("Seniority", "seniority"),
    ("Domain", "domain"),
]


def _overall_score(axes: dict) -> int:
    return round(sum(axes[k]["score"] * w for k, w in _WEIGHTS.items()) * 100)


def _verdict(score: int) -> str:
    if score >= 82:
        return "Strong fit"
    if score >= 70:
        return "Good fit"
    return "Reach"


class AnalysisService:
    def __init__(
        self,
        retrieval: RetrievalService,
        job_repo: JobRepository,
        resume_repo: ResumeRepository,
        claude: ClaudeClient,
    ) -> None:
        self._retrieval = retrieval
        self._job_repo = job_repo
        self._resume_repo = resume_repo
        self._claude = claude

    def check_prerequisites(self) -> None:
        if not self._resume_repo.has_any():
            raise NoResumeUploaded(
                "Upload a resume before running fit analysis — "
                "the assistant has nothing to compare against."
            )

    def check_rate_limits(self) -> None:
        if collector.daily_tokens_today() >= settings.DAILY_TOKEN_BUDGET:
            raise DailyTokenLimitExceeded(
                "Daily token budget reached — try again tomorrow."
            )

    async def analyze(self) -> list[FitCard]:
        all_jobs = await asyncio.to_thread(self._job_repo.list_all)
        # list_all returns DESC (newest first); reverse for stable Job-N numbering.
        ordered = list(reversed(all_jobs))
        cards = await asyncio.gather(
            *[self._analyze_job(job, i + 1) for i, job in enumerate(ordered)]
        )
        return list(cards)

    async def _analyze_job(self, job: Job, job_number: int) -> FitCard:
        # Query derived from the job itself so retrieval surfaces passages relevant
        # to what this specific role asks for, not a generic fitness sentence.
        query = f"{job.title}\n{job.raw_text[:2000]}"
        citations, empty_sources = await asyncio.to_thread(
            self._retrieval.retrieve, query, str(job.id)
        )
        context = assemble_context(citations, empty_sources)

        start = time.monotonic()
        axes, usage, model_id = await asyncio.to_thread(
            self._claude.analyze_fit, context
        )
        latency = time.monotonic() - start

        tokens = usage.input_tokens + usage.output_tokens
        cost = compute_cost(model_id, usage.input_tokens, usage.output_tokens)
        collector.record(latency_seconds=latency, tokens=tokens, cost=cost)

        logger.info(
            "analysis.fit",
            extra={
                "job_id": str(job.id),
                "job_number": job_number,
                "n_chunks": len(citations),
                "tokens": tokens,
                "latency_ms": round(latency * 1000, 1),
            },
        )

        fit_axes = [
            FitAxis(
                label=label,
                score=round(float(axes[key]["score"]), 4),
                justification=axes[key]["justification"],
            )
            for label, key in _AXIS_LABELS
        ]
        overall = _overall_score(axes)
        return FitCard(
            job_id=str(job.id),
            job_number=job_number,
            title=job.title,
            company=job.company,
            overall_score=overall,
            verdict=_verdict(overall),
            axes=fit_axes,
        )
