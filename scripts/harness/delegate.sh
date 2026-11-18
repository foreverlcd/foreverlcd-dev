#!/usr/bin/env bash
# Delega una tarea bien especificada a otro motor (un solo repo: este).
#   scripts/harness/delegate.sh <engine> <role> <task.md>
#   engine: sonnet | haiku | codex | agy | opencode    role: implementer | reviewer | art-reviewer | doc-gardener
# Roles en docs/harness/roles/<rol>.md ("implementer" -> implementer.md). Env: MODEL, REVIEW_BASE.
# Salida: .harness/runs/<timestamp>-<engine>-<role>.md. reviewer/art-reviewer/doc-gardener son SOLO LECTURA.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
ENGINE="${1:?engine}"; ROLE="${2:?role}"; TASK="${3:?task file}"
ROLE_FILE="$REPO/docs/harness/roles/$ROLE.md"
[ -f "$ROLE_FILE" ] || { echo "rol desconocido: $ROLE (falta $ROLE_FILE)"; exit 2; }
[ -f "$TASK" ] || { echo "no existe la tarea: $TASK"; exit 2; }

READONLY=1; [ "$ROLE" = "implementer" ] && READONLY=0
PROMPT="$(cat "$ROLE_FILE")

---
Repositorio de trabajo: $REPO
Principios: $REPO/docs/GOLDEN-PRINCIPLES.md

# Tarea
$(cat "$TASK")"

cd "$REPO"
if [ "$ROLE" = "reviewer" ]; then
  # REVIEW_PATHS="a b/ c" limita la revisión a esas rutas (si no, todo el árbol sin commitear).
  read -r -a RPATHS <<<"${REVIEW_PATHS:-.}"
  DIFF="$(git diff "${REVIEW_BASE:+$REVIEW_BASE...}HEAD" -- "${RPATHS[@]}"
    git ls-files --others --exclude-standard -- "${RPATHS[@]}" | while read -r f; do
      git diff --no-index /dev/null "$f" || true
    done)"
  PROMPT="$PROMPT

# Cambio a revisar (git diff ${REVIEW_BASE:+$REVIEW_BASE...}HEAD + archivos nuevos)
El diff ya está aquí: NO ejecutes comandos de shell. Si necesitas más contexto, solo lee archivos.
\`\`\`diff
${DIFF:0:150000}
\`\`\`"
fi
if [ "$ROLE" = "art-reviewer" ]; then
  SHOTS="$(find .shots -name '*.png' -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -20 | cut -d' ' -f2- | sed "s#^#$REPO/#")"
  PROMPT="$PROMPT

# Capturas más recientes (léelas con tu herramienta de lectura de imágenes)
${SHOTS:-(no hay capturas: corre node scripts/ui-shots.mjs scripts/ui-plans/smoke.json)}"
fi

mkdir -p .harness/runs
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$REPO/.harness/runs/$STAMP-$ENGINE-$ROLE.md"
# Los motores que reciben el prompt como argumento (agy, opencode) chocan con ARG_MAX si incluye el diff:
# se escribe a un archivo y se les pasa una instrucción corta para leerlo.
PROMPT_FILE="$REPO/.harness/runs/$STAMP-$ENGINE-$ROLE.prompt.md"
printf '%s' "$PROMPT" > "$PROMPT_FILE"
SHORT="Tus instrucciones completas (rol, tarea y, si aplica, el diff) están en $PROMPT_FILE. Léelo entero con tu herramienta de lectura y cúmplelo. Responde en español."

case "$ENGINE" in
  sonnet|haiku)
    if [ "$READONLY" = 1 ]; then
      TOOLS=(--allowedTools "Read" "Grep" "Glob" "Bash(git diff:*)" "Bash(git status:*)" "Bash(git log:*)" "Bash(git show:*)" --disallowedTools "Edit" "Write")
    else
      TOOLS=(--permission-mode acceptEdits --allowedTools "Read" "Grep" "Glob" "Edit" "Write" "Bash(pnpm:*)" "Bash(bash scripts/gate.sh:*)" "Bash(scripts/gate.sh:*)" "Bash(node scripts/check-boundaries.mjs)" "Bash(grep:*)" "Bash(ls:*)" "Bash(git diff:*)" "Bash(git status:*)")
    fi
    # Prompt por stdin: --allowedTools es variádico y se tragaría un prompt posicional.
    printf '%s' "$PROMPT" | claude -p --model "${MODEL:-$ENGINE}" "${TOOLS[@]}" | tee "$OUT"
    ;;
  codex)
    SANDBOX=workspace-write; [ "$READONLY" = 1 ] && SANDBOX=read-only
    printf '%s' "$PROMPT" | codex exec -m "${MODEL:-gpt-6-luna}" -s "$SANDBOX" -C "$REPO" -o "$OUT" -
    ;;
  agy)
    [ "$READONLY" = 0 ] && { echo "agy es solo de lectura en este harness"; exit 2; }
    ALLOW=""
    for tool in read_file list_dir grep_search find_by_name; do ALLOW+="\"$tool($REPO/**)\","; done
    agy ${MODEL:+--model "$MODEL"} --mode plan \
      --settings "{\"permissions\":{\"allow\":[${ALLOW%,}]}}" \
      -p "$SHORT" < /dev/null | tee "$OUT"
    ;;
  opencode)
    echo "AVISO: los modelos opencode gratuitos envían el código a terceros. No los uses en tareas con secretos o datos personales." >&2
    if [ "$READONLY" = 1 ]; then AGENT=(--agent plan); else AGENT=(--auto); fi
    opencode run -m "${MODEL:-opencode/deepseek-v4.1-flash-free}" "${AGENT[@]}" "$SHORT" < /dev/null | tee "$OUT"
    ;;
  *) echo "motor desconocido: $ENGINE"; exit 2 ;;
esac

if [ ! -s "$OUT" ]; then echo "delegate: $ENGINE no produjo salida" >&2; exit 1; fi
echo
echo "Guardado: $OUT"
[ "$READONLY" = 0 ] && echo "Siguiente: scripts/gate.sh y revisión con delegate.sh <engine> reviewer $TASK"
exit 0
