#!/usr/bin/env bash
# Gate único: boundaries, typecheck, lint, build, budgets, secrets (y shots con `full`).
#   scripts/gate.sh [full]     GATE_STRICT=1 convierte el SKIP del build (sin Postgres) en FAIL.
# Salida corta: una línea por paso; las últimas 40 líneas del log solo si falla.
set -uo pipefail
cd "$(dirname "$0")/.."
MODE="${1:-}"
LOG_DIR="$(mktemp -d)"
FAILED=0
BUILT=0
SERVER_PID=""
trap '[ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null; rm -rf "$LOG_DIR"' EXIT

fail_log() { echo "----- $1 (últimas 40 líneas) -----"; tail -n 40 "$2"; echo "-----"; }

step() {
  local name="$1"; shift
  local log="$LOG_DIR/$name.log" start=$SECONDS
  if "$@" >"$log" 2>&1; then
    printf '  ok    %-11s %3ss\n' "$name" $((SECONDS - start))
    return 0
  fi
  # Next a veces se detiene una vez para mostrar un aviso de actualización: reintenta.
  if grep -q "This command stopped to show the upgrade recommendation" "$log"; then
    "$@" >"$log" 2>&1 && { printf '  ok    %-11s %3ss (reintento)\n' "$name" $((SECONDS - start)); return 0; }
  fi
  printf '  FAIL  %-11s %3ss\n' "$name" $((SECONDS - start))
  fail_log "$name" "$log"; FAILED=1; return 1
}

skip() { printf '  SKIP  %-11s %s\n' "$1" "$2"; }

secret_scan() {
  local base hits
  base="$(git merge-base HEAD origin/main 2>/dev/null || echo HEAD)"
  hits="$( { git diff "$base"; git diff HEAD; } | grep -E '^\+' \
    | grep -inE "(password|secret|token|api[_-]?key)[\"']?\s*[:=]\s*[\"'][^\"'\$<{]{8,}|BEGIN [A-Z ]*PRIVATE KEY" \
    | grep -vE "example|placeholder|changeme|test-only" || true)"
  if git ls-files | grep -qE '^\.env($|\.local$)'; then echo ".env está versionado en git"; return 1; fi
  [ -z "$hits" ] || { echo "$hits"; return 1; }
}

db_up() { (exec 3<>/dev/tcp/127.0.0.1/5434) 2>/dev/null; }

step boundaries node scripts/check-boundaries.mjs
step typecheck node_modules/.bin/tsc --noEmit
step lint node_modules/.bin/eslint

if db_up; then
  step build pnpm build && BUILT=1
elif [ "${GATE_STRICT:-0}" = 1 ]; then
  printf '  FAIL  %-11s %s\n' build "Postgres no responde en 127.0.0.1:5434 (GATE_STRICT=1). Corre scripts/init.sh"
  FAILED=1
else
  skip build "Postgres no responde en 127.0.0.1:5434 (usa scripts/init.sh o GATE_STRICT=1)"
fi

if [ "$BUILT" = 1 ]; then step budgets node scripts/check-budgets.mjs; else skip budgets "sin build"; fi
step secrets secret_scan

if [ "$MODE" = full ]; then
  if [ "$BUILT" != 1 ]; then
    skip shots "requiere build"
  else
    PORT="$(node -e 'const s=require("net").createServer().listen(0,()=>{console.log(s.address().port);s.close()})')"
    pnpm exec next start -p "$PORT" >"$LOG_DIR/start.log" 2>&1 &
    SERVER_PID=$!
    for _ in $(seq 1 30); do curl -fs -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 1; done
    BASE_URL="http://127.0.0.1:$PORT" step shots node scripts/ui-shots.mjs scripts/ui-plans/smoke.json
    kill "$SERVER_PID" 2>/dev/null; SERVER_PID=""
  fi
fi

[ "$FAILED" = 0 ] && echo "GATE PASSED" || { echo "GATE FAILED"; exit 1; }
