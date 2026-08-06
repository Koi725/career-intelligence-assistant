#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

RED=$'\e[31m'; GREEN=$'\e[32m'; CYAN=$'\e[36m'; BOLD=$'\e[1m'; RESET=$'\e[0m'

header() { printf "\n%s==> %s%s\n" "${BOLD}${CYAN}" "$1" "${RESET}"; }
ok()     { printf "%s✓ %s%s\n" "${GREEN}" "$1" "${RESET}"; }
die()    { printf "%s✗ %s%s\n" "${RED}" "$1" "${RESET}" >&2; exit 1; }

SKIP_TESTS=false
for arg in "$@"; do
  [[ "$arg" == "--skip-tests" ]] && SKIP_TESTS=true
done

# --- Prerequisites ---
header "Checking prerequisites"
docker info &>/dev/null || die "Docker is not running — start Docker Desktop and retry."
[[ -f .env ]] || die ".env not found — copy the example below and set ANTHROPIC_API_KEY:
  cp .env.example .env   # if you have one, otherwise copy the variables from SETUP.md"
grep -q "^ANTHROPIC_API_KEY=your_" .env \
  && die "ANTHROPIC_API_KEY is still the placeholder value — fill it in before running."
ok "Docker running, .env present"

# --- Build ---
header "Building images"
docker compose build

# --- Tests ---
if [[ "$SKIP_TESTS" == false ]]; then
  header "Running backend tests"
  docker compose run --rm --no-deps backend sh -c "PYTHONPATH=/app pytest tests/ -q"

  header "Running frontend tests"
  (cd frontend && npm test)
fi

# --- Start ---
header "Starting services"
docker compose up -d

# --- Health poll ---
header "Waiting for services to be ready"
TIMEOUT=60
poll() {
  local url="$1" label="$2" elapsed=0
  until curl -sf "$url" &>/dev/null; do
    [[ $elapsed -ge $TIMEOUT ]] && die "$label did not become ready within ${TIMEOUT}s."
    sleep 2; elapsed=$((elapsed + 2))
  done
  ok "$label ready"
}
poll "http://localhost:8000/health" "Backend"
poll "http://localhost:3000"        "Frontend"

# --- Browser ---
header "Opening browser"
if command -v open &>/dev/null; then
  open http://localhost:3000
elif command -v xdg-open &>/dev/null; then
  xdg-open http://localhost:3000
else
  echo "  http://localhost:3000"
fi

# --- Summary ---
printf "\n%sBuild complete%s\n\n" "${BOLD}${GREEN}" "${RESET}"
printf "  %-24s %s\n" "App"               "http://localhost:3000"
printf "  %-24s %s\n" "API"               "http://localhost:8000"
printf "  %-24s %s\n" "API docs (Swagger)" "http://localhost:8000/docs"
echo
