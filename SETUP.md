# Setup

## Prerequisites

- **Docker Desktop 4.30+** (or Docker Engine 26+ with the Compose plugin) — must be running before `./build.sh`
- **Node.js 20+** — needed for the frontend test step; not required just to run the app
- **curl** — pre-installed on macOS and most Linux; used by `build.sh` to poll health endpoints
- **2 GB free disk** — for Docker images and the embedding model

No Python, PostgreSQL, or Anthropic SDK installed locally.

If you have Docker Engine rather than Docker Desktop, make sure the Compose plugin is installed (`docker compose version` should print v2.x). The older `docker-compose` v1 binary will fail.

## Clone

```bash
git clone <repo-url>
cd career-intelligence-assistant
```

## Configure `.env`

Create `.env` at the repo root:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
EMBEDDING_MODEL=bge-small-en-v1.5
DATABASE_URL=postgresql://postgres:postgres@db:5432/career
LOG_LEVEL=INFO
SIMILARITY_THRESHOLD=0.3
CHUNK_SIZE=512
CHUNK_OVERLAP=64
ALLOWED_ORIGINS=["http://localhost:3000"]
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Only `ANTHROPIC_API_KEY` needs to change. Get one at `console.anthropic.com`.

## Build and start

```bash
./build.sh
```

**First run takes 3–8 minutes.** Docker pulls three base images and the backend downloads `bge-small-en-v1.5` (~130 MB). Subsequent runs are fast because Docker caches the layers.

When everything works, the output looks like this:

```
==> Checking prerequisites
✓ Docker running, .env present

==> Building images
[+] Building 12.3s ...

==> Running backend tests
............ passed in 4.6s

==> Running frontend tests
 Test Files  23 passed (23)
      Tests  31 passed (31)

==> Starting services
[+] Running 3/3

==> Waiting for services to be ready
✓ Backend ready
✓ Frontend ready

==> Opening browser

Build complete

  App                      http://localhost:3000
  API                      http://localhost:8000
  API docs (Swagger)       http://localhost:8000/docs
```

To skip tests on subsequent runs:

```bash
./build.sh --skip-tests
```

## Verifying services

Each service can be checked independently once the stack is up.

```bash
# Backend
curl http://localhost:8000/health
# → {"status":"ok"}

# Database — via Docker, no local psql needed
docker exec career-intelligence-assistant-db-1 \
  psql -U postgres -d career -c "\dt"

# Frontend
open http://localhost:3000          # macOS
xdg-open http://localhost:3000      # Linux
```

## Running tests without the full stack

Backend tests are hermetic — they mock the database and the Anthropic client, so no running container is needed:

```bash
docker compose run --rm --no-deps backend sh -c "PYTHONPATH=/app pytest tests/ -q"
```

Frontend tests run locally:

```bash
cd frontend && npm test
```

## Stopping

```bash
docker compose down
```

To remove uploaded documents and reset the database to a completely blank state:

```bash
docker compose down -v
```

After a volume reset, restart with `./build.sh --skip-tests`.

## Troubleshooting

**`✗ Docker is not running — start Docker Desktop and retry.`**  
Start Docker Desktop and wait until the icon in the menu bar stops animating. Then rerun.

**`✗ .env not found`**  
The `.env` file is missing. Create it manually using the template in the Configure section above.

**`✗ ANTHROPIC_API_KEY is still the placeholder value — fill it in before running.`**  
Open `.env` and replace `your_anthropic_api_key_here` with a real key from `console.anthropic.com`.

**`Ports are not available` or `bind: address already in use` during `docker compose build`**  
Port 3000 or 8000 is held by another process. Find it with `lsof -i :3000` (or `:8000`), stop it, then retry. Alternatively, edit the host-side port in `docker-compose.yml` and update `NEXT_PUBLIC_API_URL` accordingly.

**First `docker compose build` hangs for more than 10 minutes**  
The embedding model download stalled. Run `docker compose logs backend` to see the last log line. If it stopped mid-download, `docker compose down` and retry — the layer cache will resume from where it stopped.

**`✗ Backend did not become ready within 60s.`**  
The most common cause on first boot is the database running `init.sql` to create the pgvector extension, which takes longer than the default health-check window. Run `docker compose logs db` to confirm the database is healthy, then `docker compose restart backend`.

**Browser console shows `No 'Access-Control-Allow-Origin' header is present on the requested resource`**  
The frontend origin does not match `ALLOWED_ORIGINS` in `.env`. For a local run the value should be `["http://localhost:3000"]`. If you changed ports, update this field to match.
