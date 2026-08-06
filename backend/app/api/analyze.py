from fastapi import APIRouter, Depends

from app.api.deps import get_analysis_service
from app.schemas.analysis import FitCard
from app.services.analysis import AnalysisService

router = APIRouter()


@router.post("/api/analyze", response_model=list[FitCard])
async def analyze_fit(
    service: AnalysisService = Depends(get_analysis_service),
) -> list[FitCard]:
    service.check_prerequisites()
    service.check_rate_limits()
    return await service.analyze()
