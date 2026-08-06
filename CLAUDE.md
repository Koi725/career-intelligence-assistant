---

## Frontend standards — non-negotiable

### Git — zero access

**Claude Code performs no git operations. Ever.** No `git add`, `commit`,
`push`, `checkout`, `stash`, or branch work. Not even when it seems obviously
helpful.

At the end of every task, report:
1. Files created or modified, grouped by logical change
2. What each group does, in one line
3. A suggested commit message per group
4. Anything you were unsure about

Commits are made by the human, change by change, from that report.

### Architecture — OOP principles, functional syntax

Encapsulation, single responsibility, explicit contracts, DRY — enforced hard.
Implemented with function components, custom hooks, and shared utilities.
Composition over inheritance, which is an OOP rule, not a departure from one.

- One component, one job. If you need "and" to describe it, split it.
- Every component's props are an exported `interface` in its `.types.ts`.
  No inline prop types. No `React.FC`.
- Component state stays inside the component that owns it. Lift only when two
  siblings genuinely need it — and then only to their nearest parent.
- Logic used more than once becomes a custom hook (`use-*.ts`) or a pure
  function in `src/lib/`. Never copy-pasted, never solved with a base class.
- No class components. No inheritance hierarchies. No HOCs.
- TypeScript classes are permitted only for non-React stateful logic with a
  real lifecycle. In this build that means the streaming timer controller and
  nothing else. Ask before writing a second one.

### File structure — exact, no deviation

Every component is a folder under `src/components/`, kebab-case:

src/components/scope-bar/
scope-bar.tsx the component
scope-bar.types.ts exported interfaces
scope-bar.test.tsx colocated test
index.ts re-export only: export * from "./scope-bar"


Styling mirrors it under `src/tailwind/`:

src/tailwind/
components.css imports every component css
components/
scope-bar/scope-bar.css
citations/citations.css


The cascade, in one direction only:
`<component>.css` → `components.css` → `globals.css` → imported once in
`app/layout.tsx`. **Never import a component css file from a component.**

**What belongs in a component css file:** keyframes, pseudo-elements (the
blueprint `+` marks), CSS custom properties for values off Tailwind's scale,
and complex selectors utilities can't express.

**What does not:** `@apply`. Ever. If a rule is a copy of Tailwind utilities,
it belongs in the JSX. A component with nothing to put in its css file does
not get one — an empty file is dead code.

Import order in every file: react → next → external → `@/components` →
`@/lib` → types. One blank line between groups.

### Code style

- Named imports only. Never `import *`.
- One exported component per file.
- Early returns over nested conditionals. Maximum two levels of nesting.
- No ternary chains. Two branches maximum; beyond that, a lookup map or an
  early return.
- No clever one-liners. If it needs a second read, expand it.
- No `useMemo`/`useCallback` unless a measured problem exists. Premature
  memoisation is noise.
- Handlers named for intent: `handleScopeChange`, not `onClick2`.
- Booleans read as assertions: `isStreaming`, `hasResume`, `canContinue`.
- No abbreviations except the universal ones (`id`, `url`, `ref`).
- Consistency beats personal preference. Match the file you are in.

### Comments

Rare, dry, and about **why** — never what. The code says what it does.

Good:
```ts
// Two timeouts and an interval. All three die in cleanup — a leaked interval
// here keeps "generating" running long after the component is gone.

// Overall scores are 0-100, axis scores are 0-1. Normalising here so toneFor()
// only ever sees one scale.

// The design says 0.82, not 0.8. That boundary was drawn against real score
// distributions, so leave it alone.
```

Never:
- Restating the line below it (`// set loading to true`)
- Announcing a rule you followed (`// using named imports`)
- Section banners, ASCII art, `// ===== HEADER =====`
- Manufactured jokes. Dry wit on a genuinely non-obvious decision is welcome.
  A punchline on a `useState` call is not.
- `// TODO`, `// FIXME`, commented-out code

If a comment explains confusing code, fix the code instead.

### Tests

Vitest + React Testing Library. One `.test.tsx` per component folder.

Light and real. Two to four assertions: it renders, and the one behaviour that
could silently break. No mocking gymnastics, no snapshot files, no coverage
thresholds, no testing that a `div` exists.

Test names read as sentences:
`it("shows the specific reason when only the resume is missing")`

Where the real behaviour lives — spend the effort here: gate-bar gating rules,
scope-bar state sync, citations expand/collapse, streaming timer cleanup,
`toneFor` boundaries.

### Simplicity is the tiebreaker

Two solutions that work: ship the shorter one. Complexity is a cost paid by
every future reader, and this codebase is read by a reviewer deciding whether
to hire.

If a task is turning complicated, stop and say so before writing it.

---

## Backend standards — non-negotiable

### Git — zero access

Same rule as the frontend. No git operations, ever. Report files grouped by
logical change with a suggested commit message per group. The human commits.

### Layout

backend/
├── pyproject.toml
├── Dockerfile
├── .dockerignore
└── app/
├── main.py app factory, routers, middleware
├── config.py Settings — the ONLY place env is read
├── api/
│ ├── deps.py shared FastAPI dependencies
│ ├── resume.py
│ ├── jobs.py
│ ├── chat.py
│ └── analyze.py
├── schemas/ pydantic request/response models
│ ├── resume.py
│ ├── job.py
│ └── chat.py
├── services/ orchestration — one class per file
│ ├── ingestion.py IngestionService
│ ├── retrieval.py RetrievalService
│ └── chat.py ChatService
├── db/
│ ├── session.py engine, SessionLocal, get_db
│ ├── models.py SQLAlchemy ORM models
│ └── repositories/
│ ├── chunk.py ChunkRepository
│ ├── resume.py ResumeRepository
│ └── job.py JobRepository
├── rag/
│ ├── chunker.py Chunker
│ ├── embedder.py Embedder protocol + OpenAIEmbedder
│ ├── prompts.py system prompt + context assembly
│ └── parser.py markdown → AnswerSection[]
├── llm/
│ └── claude.py ClaudeClient
└── core/
├── logging.py json formatter, correlation id
├── errors.py domain exceptions + handlers
└── metrics.py in-memory counters
tests/


Python is module-per-concern, not folder-per-class. Do NOT mirror the
frontend's folder convention here — `chunker/chunker.py` is wrong in Python.

### Layering — strict, one direction

    api → services → repositories → db

Never skip a layer, never reverse one.

- **Routes** parse the request, call one service method, return a response
  model. No business logic, no SQLAlchemy, no LLM calls. If a route is over
  20 lines it is doing someone else's job.
- **Services** orchestrate. They hold collaborators, not data.
- **Repositories** own every query. No SQLAlchemy expression exists outside
  `db/repositories/`.

### OOP — here it is the right answer

- Services, repositories and clients are classes. Dependencies are injected
  through `__init__`. No module-level singletons, no global mutable state,
  no service locating itself.
- Classes hold collaborators. Data is a Pydantic model or a dataclass, never
  a class with behaviour bolted on.
- **One Protocol only**: `Embedder`. It exists so tests can inject a fake
  without mocking a network client. Everything else is concrete. Ask before
  adding a second abstraction.
- No inheritance except Protocol/ABC. No mixins, no base classes "for later".
- If a class has one method and no state, it should have been a function.

### Python style

- Python 3.11. Every function signature fully annotated, parameters and
  return. Locals only where non-obvious.
- Functions under ~40 lines. Modules under ~200. Two levels of nesting max.
- Early returns over nested conditionals.
- Explicit named imports. Never `import *`. No relative imports past one level.
- `os.getenv` appears in `config.py` and nowhere else in the codebase.
- No `Manager`, `Helper`, `Util`, `Handler` in a class name. Name the thing
  it actually does.
- Booleans read as assertions: `has_resume`, `is_indexed`.

### Errors

- Domain exceptions live in `core/errors.py` and are raised by services.
- A single set of exception handlers in `main.py` maps them to responses.
  Routes do not raise `HTTPException` for domain conditions.
- Never a bare `except:`. Never `except Exception: pass`. Catch the specific
  exception you expect and handle it.
- Every error message is something a user can act on.

### Schemas

- `app/schemas/` mirrors `frontend/src/lib/types.ts` **field for field**.
  Same names, same casing decisions. That file is the API contract.
- Every route declares a `response_model`. No bare `dict` crosses a boundary.
- Request and response models are separate types even when they look alike.

### Database

- `init.sql` enables pgvector and creates the HNSW index.
  `metadata.create_all` on startup. **No Alembic** — deliberate, documented.
- UUID primary keys, `timestamptz` everywhere.
- Sync SQLAlchemy. `async def` only on the SSE chat route, with DB work via
  `await asyncio.to_thread(...)`. Do not introduce an async driver.

### Logging

- Structured JSON. Correlation id from `X-Request-ID` middleware, echoed back
  in the response header.
- **Never log raw chunk text, resume content, question text, or API keys.**
  Log ids, scores, counts, timings, token usage. Resumes are PII and this is
  a health-AI consultancy reviewing the code.

### Tests

- pytest. Fast and hermetic — no network, no real API calls, no live LLM.
  Fake the `Embedder` protocol; mock the Anthropic client at its boundary.
- Test what can silently be wrong: chunk boundaries, retrieval budgets,
  context assembly, the markdown parser, route contracts.
- Names describe behaviour:
  `test_retrieval_returns_resume_chunks_even_when_job_has_more_matches`
- Whole suite under 10 seconds. No flaky test ships.

### Comments

Same rule as the frontend. Rare, dry, about **why**. Delete anything that
restates the line below it. Dry wit on a genuinely non-obvious decision is
welcome; a punchline on a constructor is not.

Good:
```python
# Two ANN queries, not one. A verbose job description outnumbers the resume
# chunks, and a global top-k would answer "how do I fit" with zero evidence
# about the candidate.
```

### Simplicity is the tiebreaker

Two designs that work: ship the shorter one. If a task is turning into a
framework, stop and say so before writing it.