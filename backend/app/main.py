from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import jobs as jobs_api
from app.api import resume as resume_api
from app.db.session import Base, engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(resume_api.router)
app.include_router(jobs_api.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
