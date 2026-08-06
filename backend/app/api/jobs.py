import io

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pypdf import PdfReader

from app.api.deps import get_ingestion_service
from app.schemas.job import JobDoc
from app.services.ingestion import IngestionService

router = APIRouter()

_MAX_BYTES = 5 * 1024 * 1024
_MAX_PAGES = 20


@router.post("/api/jobs", response_model=JobDoc, response_model_by_alias=True)
async def create_job(
    service: IngestionService = Depends(get_ingestion_service),
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
) -> JobDoc:
    if text and file:
        raise HTTPException(status_code=422, detail="Provide either text or a file, not both.")

    if text:
        if not text.strip():
            raise HTTPException(status_code=422, detail="Job description text is empty.")
        return service.ingest_job(text=text.strip(), source="paste")

    if file:
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
        return service.ingest_job(text="\n\n".join(pages), source="pdf")

    raise HTTPException(status_code=422, detail="Provide either 'text' (form field) or 'file' (PDF upload).")


@router.get("/api/jobs", response_model=list[JobDoc], response_model_by_alias=True)
def list_jobs(
    service: IngestionService = Depends(get_ingestion_service),
) -> list[JobDoc]:
    return service.list_jobs()
