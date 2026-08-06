from app.schemas.resume import _CamelBase


class FitAxis(_CamelBase):
    label: str
    score: float  # 0.0–1.0
    justification: str


class FitCard(_CamelBase):
    job_id: str
    job_number: int
    title: str
    company: str
    overall_score: int  # 0–100, computed from weighted axis mean
    verdict: str
    axes: list[FitAxis]
