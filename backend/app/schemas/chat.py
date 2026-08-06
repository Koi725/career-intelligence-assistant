from app.schemas.resume import _CamelBase


class AnswerBullet(_CamelBase):
    lead: str
    continuation: str


class AnswerSection(_CamelBase):
    heading: str | None = None
    paragraph: str | None = None
    bullets: list[AnswerBullet] = []


class Citation(_CamelBase):
    id: str
    kind: str
    label: str
    score: float
    locator: str
    chunk: str


class ExchangeFooter(_CamelBase):
    latency_seconds: float
    tokens: int
    cost_dollars: float
    model: str
    chunks: int


class ChatRequest(_CamelBase):
    message: str
    scope: str = "all"
    history: list[dict] = []
