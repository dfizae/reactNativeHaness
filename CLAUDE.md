# 저장소 안내

- 프론트엔드(React Native/Expo)와 에이전트 하네스는 전부 `frontend/`에 있다.
- **Claude Code 세션은 반드시 `frontend/`에서 시작한다** (`cd frontend && claude`). 루트에서 시작하면 `frontend/.claude/settings.json`의 훅과 `frontend/AGENTS.md` 규칙이 로드되지 않는다.
- 백엔드가 이 저장소 구조에 합류하면 `backend/` 폴더를 쓴다 — 프론트 하네스는 `frontend/` 밖 경로를 건드리지 않는다.
- CI 워크플로는 두지 않는다(2026-09-01 결정). 프론트 검사는 `frontend/`의 Claude Code 훅 + 로컬 검증 명령(`pnpm typecheck`·`lint`·`test`·`tokens:check`·`harness:check`)으로 수행한다.
