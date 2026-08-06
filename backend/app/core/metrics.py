from collections import defaultdict
from datetime import date


class MetricsCollector:
    # Module-level singleton below — deliberate. Metrics are process-global state
    # by nature; the Prometheus client works the same way.
    # Production path: replace record() with Prometheus counter/histogram calls.

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._request_count: int = 0
        self._latencies: list[float] = []
        self._total_tokens: int = 0
        self._total_cost: float = 0.0
        self._daily_tokens: defaultdict[date, int] = defaultdict(int)

    def record(self, latency_seconds: float, tokens: int, cost: float) -> None:
        self._request_count += 1
        self._latencies.append(latency_seconds)
        self._total_tokens += tokens
        self._total_cost += cost
        self._daily_tokens[date.today()] += tokens

    def daily_tokens_today(self) -> int:
        return self._daily_tokens[date.today()]

    def summary(self) -> dict:
        lats = sorted(self._latencies)
        n = len(lats)
        p50 = lats[n // 2] if n else 0.0
        p95 = lats[int(n * 0.95)] if n else 0.0
        return {
            "request_count": self._request_count,
            "p50_latency_seconds": round(p50, 3),
            "p95_latency_seconds": round(p95, 3),
            "total_tokens": self._total_tokens,
            "total_cost_dollars": round(self._total_cost, 4),
        }


collector = MetricsCollector()
