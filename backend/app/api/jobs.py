from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.api.deps import get_ingestion_service
from app.schemas.job import JobDoc
from app.services.ingestion import IngestionService

router = APIRouter()


@router.post("/api/jobs", response_model=JobDoc, response_model_by_alias=True)
async def create_job(
    service: IngestionService = Depends(get_ingestion_service),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
) -> JobDoc:
    if text and file:
        raise HTTPException(status_code=422, detail="Provide either text or a file, not both.")
    if text:
        return service.ingest_job_text(text.strip())
    if file:
        data = await file.read()
        return service.ingest_job_file(
            data=data,
            filename=file.filename or "job.pdf",
            content_type=file.content_type or "",
        )
    raise HTTPException(
        status_code=422,
        detail="Provide either 'text' (form field) or 'file' (PDF upload).",
    )


@router.get("/api/jobs", response_model=list[JobDoc], response_model_by_alias=True)
def list_jobs(
    service: IngestionService = Depends(get_ingestion_service),
) -> list[JobDoc]:
    return service.list_jobs()
