#!/usr/bin/env bash
# Encadena planes en este repo: implementar -> gate -> revisar -> parar. NO hace commit (integra el planificador).
#   scripts/harness/pipeline.sh <impl-engine>:<review-engine>:<plan.md> [...]
# Con varios planes, el siguiente solo arranca si el gate del anterior pasó; la revisión la lee el planificador.
set -uo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO"
for spec in "$@"; do
  IFS=: read -r IMPL REV PLAN <<<"$spec"
  NAME="$(basename "$PLAN" .md)"
  echo "=== $NAME: implementa con $IMPL"
  bash scripts/harness/delegate.sh "$IMPL" implementer "$PLAN" | tail -15
  echo "=== $NAME: gate"
  if ! bash scripts/gate.sh | tail -12; then
    echo "=== $NAME: GATE FAILED, pipeline detenido"; exit 1
  fi
  echo "=== $NAME: revisa con $REV"
  bash scripts/harness/delegate.sh "$REV" reviewer "$PLAN" | tail -40
done
echo "=== pipeline terminado (sin commit: revisa el árbol de trabajo)"
