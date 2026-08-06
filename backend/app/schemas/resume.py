import uuid

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class _CamelBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ResumeDoc(_CamelBase):
    id: uuid.UUID
    filename: str
    pages: int
    chunks: int
    size_kb: float
