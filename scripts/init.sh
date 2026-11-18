#!/usr/bin/env bash
# Arranque del entorno para cualquier sesión de agente: Postgres + migraciones (solo estado) + pnpm dev.
#   scripts/init.sh         levanta todo y imprime un resumen de 5 líneas
#   scripts/init.sh stop    detiene el servidor de desarrollo (deja Postgres arriba)
# Env: PORT (3000). Log: .harness/dev.log  pid: .harness/dev.pid
set -uo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-3000}"
mkdir -p .harness
PIDFILE=.harness/dev.pid
LOG=.harness/dev.log

alive() { [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; }

if [ "${1:-}" = stop ]; then
  if alive; then
    PID="$(cat "$PIDFILE")"
    kill -- "-$PID" 2>/dev/null || kill "$PID" 2>/dev/null
    rm -f "$PIDFILE"; echo "dev detenido (pid $PID)"
  else
    rm -f "$PIDFILE"; echo "dev no estaba corriendo"
  fi
  exit 0
fi

db_up() { (exec 3<>/dev/tcp/127.0.0.1/5434) 2>/dev/null; }

docker compose up -d db >/dev/null 2>&1 || echo "aviso: docker compose up -d db falló (¿docker activo y .env presente?)"
DB="no responde"
for _ in $(seq 1 30); do db_up && { DB="ok"; break; }; sleep 1; done

MIG="$(pnpm exec prisma migrate status 2>&1 | grep -E 'Database schema is up to date|have not yet been applied|No migration found|failed|error' | head -1)"
[ -n "$MIG" ] || MIG="estado desconocido"

if alive; then
  DEV="reutilizado (pid $(cat "$PIDFILE"))"
else
  PORT="$PORT" setsid pnpm dev -p "$PORT" >"$LOG" 2>&1 < /dev/null &
  echo $! >"$PIDFILE"
  DEV="iniciado (pid $!)"
fi

wait_http() { for _ in $(seq 1 60); do curl -fs -o /dev/null "$1" && { echo ok; return; }; sleep 1; done; echo "sin respuesta"; }
ROOT="$(wait_http "http://127.0.0.1:$PORT/")"
HEALTH="$(wait_http "http://127.0.0.1:$PORT/api/health")"

echo "postgres : $DB (127.0.0.1:5434)"
echo "migrate  : $MIG"
echo "dev      : $DEV en :$PORT (log $LOG)"
echo "GET /    : $ROOT"
echo "/api/health : $HEALTH"
[ "$DB" = ok ] && [ "$ROOT" = ok ] && [ "$HEALTH" = ok ]
