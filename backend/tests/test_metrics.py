"""MetricsCollector unit tests and /api/metrics endpoint contract."""
import pytest
from fastapi.testclient import TestClient

from app.core.metrics import MetricsCollector, collector
from app.main import app


# ---------------------------------------------------------------------------
# Unit tests — isolated collector instance, unaffected by the global singleton
# ---------------------------------------------------------------------------

def test_counters_increment_correctly():
    """record() accumulates request count, tokens and cost."""
    m = MetricsCollector()
    m.record(latency_seconds=1.0, tokens=100, cost=0.01)
    m.record(latency_seconds=2.0, tokens=200, cost=0.02)

    s = m.summary()
    assert s["request_count"] == 2
    assert s["total_tokens"] == 300
    assert s["total_cost_dollars"] == pytest.approx(0.03, abs=1e-6)


def test_p50_and_p95_latency_are_ordered():
    """p95 >= p50, and both are positive after several records."""
    m = MetricsCollector()
    for i in range(20):
        m.record(latency_seconds=float(i + 1), tokens=10, cost=0.001)

    s = m.summary()
    assert s["p50_latency_seconds"] > 0
    assert s["p95_latency_seconds"] >= s["p50_latency_seconds"]


def test_reset_zeroes_all_counters():
    """reset() returns the collector to a clean slate."""
    m = MetricsCollector()
    m.record(latency_seconds=1.0, tokens=50, cost=0.005)
    m.reset()

    s = m.summary()
    assert s["request_count"] == 0
    assert s["total_tokens"] == 0
    assert s["total_cost_dollars"] == 0.0


def test_daily_tokens_accumulate_then_reset():
    """daily_tokens_today() reflects only tokens recorded since reset()."""
    m = MetricsCollector()
    m.record(latency_seconds=0.5, tokens=1000, cost=0.01)
    assert m.daily_tokens_today() == 1000
    m.reset()
    assert m.daily_tokens_today() == 0


# ---------------------------------------------------------------------------
# Endpoint test — uses the global singleton (reset by the autouse fixture)
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_metrics_endpoint_returns_expected_shape(client):
    """GET /api/metrics returns all required keys with sensible types."""
    collector.record(latency_seconds=0.5, tokens=100, cost=0.005)

    response = client.get("/api/metrics")
    assert response.status_code == 200

    data = response.json()
    assert data["request_count"] == 1
    assert data["total_tokens"] == 100
    assert isinstance(data["p50_latency_seconds"], float)
    assert isinstance(data["p95_latency_seconds"], float)
    assert isinstance(data["total_cost_dollars"], float)
