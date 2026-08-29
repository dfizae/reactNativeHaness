#!/usr/bin/env bash
# .agents/ (정본) → .claude/ (Claude Code 미러) 동기화
set -eu
cd "$(dirname "$0")/.."
mkdir -p .claude/rules .claude/skills
rsync -a --delete .agents/rules/ .claude/rules/
rsync -a --delete .agents/skills/ .claude/skills/
echo "미러 동기화 완료: .claude/rules, .claude/skills"
