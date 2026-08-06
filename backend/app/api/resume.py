from fastapi import APIRouter, Depends, UploadFile

from app.api.deps import get_ingestion_service
from app.schemas.resume import ResumeDoc
from app.services.ingestion import IngestionService

router = APIRouter()


@router.post("/api/resume", response_model=ResumeDoc, response_model_by_alias=True)
async def upload_resume(
    file: UploadFile,
    service: IngestionService = Depends(get_ingestion_service),
) -> ResumeDoc:
    data = await file.read()
    return service.ingest_resume(
        data=data,
        filename=file.filename or "resume.pdf",
        content_type=file.content_type or "",
    )
