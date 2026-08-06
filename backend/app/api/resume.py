import io

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pypdf import PdfReader

from app.api.deps import get_ingestion_service
from app.schemas.resume import ResumeDoc
from app.services.ingestion import IngestionService

router = APIRouter()

_MAX_BYTES = 5 * 1024 * 1024
_MAX_PAGES = 20


@router.post("/api/resume", response_model=ResumeDoc, response_model_by_alias=True)
async def upload_resume(
    file: UploadFile,
    service: IngestionService = Depends(get_ingestion_service),
) -> ResumeDoc:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=422, detail="Only PDF files are accepted.")

    data = await file.read()
    if len(data) > _MAX_BYTES:
        raise HTTPException(status_code=422, detail="File exceeds the 5 MB limit.")

    reader = PdfReader(io.BytesIO(data))
    if len(reader.pages) > _MAX_PAGES:
        raise HTTPException(status_code=422, detail=f"PDF exceeds the {_MAX_PAGES}-page limit.")

    pages = [page.extract_text() or "" for page in reader.pages]
    if not any(p.strip() for p in pages):
        raise HTTPException(status_code=422, detail="PDF contains no extractable text.")

    return service.ingest_resume(
        filename=file.filename or "resume.pdf",
        pages=pages,
        size_bytes=len(data),
    )
