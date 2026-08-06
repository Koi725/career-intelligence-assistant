import os

import pytest

# Set before any app module is imported so pydantic-settings validation passes.
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")
os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/test")


@pytest.fixture(autouse=True)
def reset_metrics():
    """Reset the global metrics collector before each test.

    Without this, counters persist across tests and test_metrics becomes
    order-dependent — which is the same thing as flaky.
    """
    from app.core.metrics import collector
    collector.reset()
