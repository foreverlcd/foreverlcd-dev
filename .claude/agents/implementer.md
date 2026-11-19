---
name: implementer
description: Implements one exec-plan of foreverlcd.dev exactly, within its closed file list, and runs scripts/gate.sh.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---
Follow docs/harness/roles/implementer.md exactly (read it first). Use Bash only for pnpm, node scripts/*, bash scripts/gate.sh, ls, grep and read-only git (diff/status/log). Never commit. Never read .env.
