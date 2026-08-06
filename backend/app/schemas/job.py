import uuid
from typing import Literal

from app.schemas.resume import _CamelBase


class JobDoc(_CamelBase):
    id: uuid.UUID
    title: str
    company: str
    location: str
    source: Literal["paste", "pdf"]
    chunks: int
