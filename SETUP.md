# Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Docker Desktop | 4.x+ | Must be running before you call `./build.sh` |
| Node.js | 20+ | Required for frontend tests; not needed just to run the app |
| curl | any | Used by `build.sh` to poll health endpoints |

You do **not** need Python, PostgreSQL, or the Anthropic SDK installed locally — the backend runs entirely inside Docker.

## Clone

```bash
git clone <repo-url>
cd career-intelligence-assistant
```

## Configure `.env`

Create a `.env` file in the repo root with the following variables:

```
ANTHROPIC_API_KEY=sk-ant-...          # required — get from console.anthropic.com
ANTHROPIC_MODEL=claude-sonnet-4-6     # or any claude-3-x-sonnet model
EMBEDDING_MODEL=bge-small-en-v1.5     # model name passed to sentence-transformers
DATABASE_URL=postgresql://postgres:postgres@db:5432/career
LOG_LEVEL=INFO
SIMILARITY_THRESHOLD=0.3
CHUNK_SIZE=512
CHUNK_OVERLAP=64
ALLOWED_ORIGINS=["http://localhost:3000"]
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Only `ANTHROPIC_API_KEY` needs to change from these defaults for a local run.

## Build and start

```bash
./build.sh
```

The script:
1. Verifies Docker is running and `.env` is present and filled in
2. Builds the Docker images
3. Runs the backend test suite inside the container
4. Runs the frontend test suite locally
5. Starts all three services (`db`, `backend`, `frontend`) in the background
6. Polls `GET /health` and `GET http://localhost:3000` until both respond
7. Opens your default browser to `http://localhost:3000`

To skip the test step (useful for iterating quickly):

```bash
./build.sh --skip-tests
```

## Stopping

```bash
docker compose down
```

Add `-v` to also remove the Postgres data volume (full reset).

## Troubleshooting

**`✗ Docker is not running`**
Start Docker Desktop and wait for the whale icon to stop animating, then retry.

**`✗ ANTHROPIC_API_KEY is still the placeholder value`**
Open `.env`, replace `your_anthropic_api_key_here` with your actual key from [console.anthropic.com](https://console.anthropic.com).

**`✗ Backend did not become ready within 60s`**
The most common cause is the database taking longer than expected on first boot (it runs `init.sql` to enable the pgvector extension). Run `docker compose logs db` to confirm it is healthy, then `docker compose restart backend`.

**Port already in use (3000 or 8000)**
Something else is using those ports. Either stop the conflicting process or edit `docker-compose.yml` to map different host ports.
