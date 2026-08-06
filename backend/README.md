# Backend

FastAPI service — resume ingestion, job ingestion, retrieval-augmented chat.

## Layout

```
app/
├── main.py          app factory, routers, middleware, health endpoint
├── config.py        Settings — the only place os.getenv is called
├── api/
│   ├── deps.py      shared FastAPI dependencies
│   ├── resume.py    POST /api/resume
│   ├── jobs.py      POST /api/jobs, GET /api/jobs, DELETE /api/jobs/{id}
│   └── chat.py      POST /api/chat (SSE)
├── schemas/         Pydantic request/response models — mirrors frontend/src/lib/types.ts
├── services/
│   ├── ingestion.py IngestionService — parse, chunk, embed, persist
│   ├── retrieval.py RetrievalService — embed query, ANN search, scope
│   └── chat.py      ChatService — assemble context, stream from Claude
├── db/
│   ├── session.py   engine, SessionLocal, get_db
│   ├── models.py    Resume, Job, Chunk ORM models
│   └── repositories/
│       ├── chunk.py  ChunkRepository
│       ├── resume.py ResumeRepository
│       └── job.py    JobRepository
├── rag/
│   ├── chunker.py   fixed-size sliding-window chunker
│   ├── embedder.py  Embedder protocol + OpenAIEmbedder (sentence-transformers)
│   ├── prompts.py   SYSTEM_PROMPT, assemble_context, build_system_prompt
│   └── parser.py    markdown → AnswerSection[]
├── llm/
│   └── claude.py    ClaudeClient — wraps anthropic SDK
└── core/
    ├── logging.py   JSON formatter, CorrelationMiddleware
    ├── errors.py    domain exceptions + FastAPI exception handlers
    └── metrics.py   in-memory token/request counters
```

## Layering

Requests flow in one direction:

```
api → services → repositories → db
```

- **Routes** parse the request, call one service method, return a response model. No business logic, no SQLAlchemy, no LLM calls.
- **Services** orchestrate. They call repositories, the embedder, and the LLM client.
- **Repositories** own every SQLAlchemy query. No ORM expressions exist outside `db/repositories/`.

## Endpoints

### `POST /api/resume`

Upload a PDF resume. Returns a `ResumeDoc`.

```
Content-Type: multipart/form-data
Body: file=<PDF bytes>

Response 200:
{
  "filename": "resume.pdf",
  "pages": 3,
  "chunks": 22,
  "size_kb": 148
}
```

### `POST /api/jobs`

Create a job from pasted text or a PDF. Provide exactly one of `text` or `file`.

```
Content-Type: multipart/form-data
Body: text=<job description text>
  — or —
Body: file=<PDF bytes>

Response 200:
{
  "id": "uuid",
  "title": "Senior Frontend Engineer",
  "company": "Acme",
  "location": "Remote",
  "source": "paste",   // or "pdf"
  "chunks": 14
}
```

### `GET /api/jobs`

List all indexed jobs.

```
Response 200: [JobDoc, ...]
```

### `DELETE /api/jobs/{id}`

Delete a job and all its indexed chunks.

```
Response 204 (no body)
Response 404: { "detail": "Job <id> not found." }
```

### `POST /api/chat`

Stream a chat response as Server-Sent Events. Conversation history is passed by the client for LLM context but does not influence retrieval.

```json
{
  "message": "How does my experience match the backend role?",
  "scope": "all",        // or a job UUID to restrict retrieval to one job
  "history": [
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

SSE event stream — four event types, in order:

- `sources` — `[Citation, ...]`: the retrieved chunks, sent before any text is generated
- `delta` — `{ "text": "..." }`: one token or small chunk of streaming text
- `done` — `{ "sections": [AnswerSection, ...], "footer": ExchangeFooter }`: the fully parsed answer with billing metadata
- `error` — `{ "code": "...", "request_id": "..." }`: sent instead of `done` on failure

### `GET /health`

Liveness check. Returns `{ "status": "ok" }`.

### `GET /api/metrics`

In-process counters: request count, token usage, daily budget consumed.

## Running locally (inside Docker)

```bash
docker compose up backend
```

For a hot-reload development loop the backend volume-mounts `./backend:/app`, so file changes are reflected immediately.

> **Production note:** this image installs the `dev` extra (`pytest`, `httpx`) because this compose stack is a local development setup. A production image should use a multi-stage build and install only the base dependencies with `pip install --no-cache-dir .`.

## Running tests

```bash
docker compose run --rm --no-deps backend sh -c "PYTHONPATH=/app pytest tests/ -q"
```

No live database, no network calls. The `Embedder` protocol is satisfied by a deterministic fake; the Anthropic client is mocked at the SDK boundary.

## Adding an endpoint

1. Add the route to the appropriate file in `app/api/`. Keep it under ~20 lines — if it isn't, the logic belongs in a service.
2. Add the business logic to the relevant service in `app/services/`. Services call repositories; they do not call SQLAlchemy directly.
3. If you need a new query, add a method to the appropriate repository in `app/db/repositories/`.
4. Add request/response models to `app/schemas/` and mirror them in `frontend/src/lib/types.ts`.
5. Register exception handlers for any new domain exceptions in `app/core/errors.py` and `app/main.py`.
6. Write tests in `tests/`. Route contracts go in `test_api.py`; business logic goes in its own test file.
