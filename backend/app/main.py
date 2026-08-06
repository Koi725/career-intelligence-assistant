from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat as chat_api
from app.api import jobs as jobs_api
from app.api import resume as resume_api
from app.config import settings
from app.core.errors import register_error_handlers
from app.core.logging import CorrelationMiddleware, configure_logging
from app.core.metrics import collector
from app.db.session import Base, engine

configure_logging(settings.LOG_LEVEL)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(CorrelationMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(resume_api.router)
app.include_router(jobs_api.router)
app.include_router(chat_api.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/metrics")
def get_metrics() -> dict:
    return collector.summary()
