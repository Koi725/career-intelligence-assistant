"""Analysis route and service unit tests — no network, no live LLM, no real database."""
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.core.errors import NoResumeUploaded
from app.main import app
from app.schemas.analysis import FitAxis, FitCard
from app.services.analysis import AnalysisService, _overall_score, _verdict


# ---------------------------------------------------------------------------
# Score computation (pure functions — no I/O)
# ---------------------------------------------------------------------------


class TestScoreComputation:
    def test_weighted_mean_and_verdict_thresholds(self) -> None:
        axes = {
            "technical":  {"score": 0.9, "justification": "Strong Python depth."},
            "experience": {"score": 0.8, "justification": "Five years product eng."},
            "seniority":  {"score": 0.7, "justification": "Led a sub-team."},
            "domain":     {"score": 0.6, "justification": "Adjacent industry."},
        }
        # 0.9×0.3 + 0.8×0.3 + 0.7×0.2 + 0.6×0.2 = 0.27 + 0.24 + 0.14 + 0.12 = 0.77 → 77
        assert _overall_score(axes) == 77
        assert _verdict(100) == "Strong fit"
        assert _verdict(82) == "Strong fit"
        assert _verdict(81) == "Good fit"
        assert _verdict(70) == "Good fit"
        assert _verdict(69) == "Reach"
        assert _verdict(0) == "Reach"


# ---------------------------------------------------------------------------
# Route contracts
# ---------------------------------------------------------------------------


_FAKE_CARD = FitCard(
    job_id="00000000-0000-0000-0000-000000000001",
    job_number=1,
    title="Software Engineer",
    company="Acme",
    overall_score=80,
    verdict="Good fit",
    axes=[
        FitAxis(label="Technical",  score=0.85, justification="Strong Python background."),
        FitAxis(label="Experience", score=0.80, justification="Five years product eng."),
        FitAxis(label="Seniority",  score=0.75, justification="Led cross-team initiative."),
        FitAxis(label="Domain",     score=0.70, justification="B2B SaaS overlap."),
    ],
)


def _make_analysis_service(*, has_resume: bool = True) -> AnalysisService:
    svc = MagicMock(spec=AnalysisService)
    if not has_resume:
        svc.check_prerequisites = MagicMock(
            side_effect=NoResumeUploaded(
                "Upload a resume before running fit analysis — "
                "the assistant has nothing to compare against."
            )
        )
    else:
        svc.check_prerequisites = MagicMock()
    svc.check_rate_limits = MagicMock()
    return svc


@pytest.fixture
def client():
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


class TestAnalyzeRoute:
    def test_returns_one_card_per_job(self, client: TestClient) -> None:
        svc = _make_analysis_service()
        svc.analyze = AsyncMock(return_value=[_FAKE_CARD])
        app.dependency_overrides[deps.get_analysis_service] = lambda: svc
        try:
            resp = client.post("/api/analyze")
        finally:
            app.dependency_overrides.pop(deps.get_analysis_service, None)

        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["jobNumber"] == 1
        assert data[0]["title"] == "Software Engineer"
        assert data[0]["verdict"] == "Good fit"
        assert len(data[0]["axes"]) == 4

    def test_no_resume_returns_400(self, client: TestClient) -> None:
        svc = _make_analysis_service(has_resume=False)
        svc.analyze = AsyncMock(return_value=[])
        app.dependency_overrides[deps.get_analysis_service] = lambda: svc
        try:
            resp = client.post("/api/analyze")
        finally:
            app.dependency_overrides.pop(deps.get_analysis_service, None)

        assert resp.status_code == 400
        assert "resume" in resp.json()["detail"].lower()
