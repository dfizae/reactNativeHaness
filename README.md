# React Native 에이전트 하네스

Expo / React Native 프로젝트에서 AI 코딩 에이전트가 **Pencil(`design.pen`) 디자인 원천**, **핀테크 보안 규칙**, **백엔드 계약**을 일관되게 따르도록 만드는 하네스입니다. 앱 코드는 들어 있지 않습니다. 규칙·스킬·훅·검사 스크립트·문서 틀만 있고, 새 프로젝트에 복사해 `<…>` 로 표시한 곳을 채워 씁니다.

전제 스택은 Expo SDK 57 · React Native 0.86 · TypeScript strict · Expo Router · NativeWind v4 · React Native Reusables · TanStack Query · Zustand · axios · pnpm 입니다(`frontend/AGENTS.md`).

## 구성

```text
├── CLAUDE.md                     # 저장소 안내 (Claude Code 세션은 frontend/ 에서 시작)
└── frontend/                     # 프로젝트의 프론트 폴더에 그대로 놓이는 단위
    ├── AGENTS.md                 # 에이전트 진입점 — 프로젝트 정보(채울 곳)·디렉토리·승인·보고
    ├── CLAUDE.md                 # @AGENTS.md
    ├── .agents/                  # 하네스 정본
    │   ├── rules/                #   00~60 기본, 70 디자인 토큰, 80 핀테크 보안, 90 백엔드 계약
    │   └── skills/               #   pencil-design · fintech-ui-patterns
    ├── .claude/                  # Claude Code 미러(rules, skills) + settings.json(권한·훅)
    ├── skills-lock.json          # 스킬 출처 기록
    ├── docs/                     # 문서 틀 — frontend-spec · api-contract · api-guide
    ├── scripts/                  # sync-harness · check-harness · harness-backup/restore ·
    │                             # sync-pen-tokens · sync-tokens · check-tokens · hooks/ · figma/
    ├── design.pen                # Pencil 작업 파일 = 디자인의 확정 원천 (문서 변수 51개 + 아트보드)
    ├── design/                   # tokens.json(값) · DESIGN.md(의도) · design-map.json(노드 id) · figma-assets/
    ├── tailwind.config.js        # 생성 파일 (pnpm tokens:sync)
    ├── global.css                # 생성 파일
    ├── lib/theme.ts              # 생성 파일
    └── package.json              # 하네스 명령만 담은 scripts
```

## 새 프로젝트에 적용하기

1. **스택을 준비합니다.** 위 전제 스택으로 Expo 프로젝트를 만들고 프론트 폴더(예: `frontend/`)에 둡니다.
2. **하네스를 복사합니다.** 이 저장소의 `frontend/` 안에서 `.agents/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, `skills-lock.json`, `docs/`, `scripts/`, `design/`, `design.pen` 을 프로젝트의 프론트 폴더로 옮기고, 루트 `CLAUDE.md` 를 저장소 루트에 둡니다.
3. **명령을 합칩니다.** `frontend/package.json` 의 `scripts` 를 프로젝트 `package.json` 에 더합니다. 하네스 문서는 아래 명령도 있다고 전제합니다: `typecheck`(`tsc --noEmit`), `lint`(`expo lint`), `test`(`jest`), `ui:add`(`pnpm dlx shadcn@latest add --yes`).
4. **`.gitignore` 를 합칩니다.** `WORKLOG.md`(로컬 전용 작업 기록)를 무시 목록에 넣습니다.
5. **프로젝트 값을 채웁니다.** `AGENTS.md` 제목과 첫 두 항목, `docs/frontend-spec.md`, `docs/api-contract.md`(§1 공통 규약은 규칙 80·90 이 기준으로 삼는 값이라 비워 두지 않습니다), `docs/api-guide.md` §2·§5.
6. **디자인을 바꿉니다.** `design.pen` 에는 이전 프로젝트의 아트보드가 들어 있습니다. Pencil 에서 아트보드를 지우고 문서 변수 51개는 남긴 뒤 새 화면을 그립니다. 함께 `design/design-map.json` 의 노드 매핑, `design/DESIGN.md` 5~7장, `design/figma-assets/` 이미지를 새 디자인에 맞게 고칩니다. 값을 바꿨으면 `pnpm tokens:sync` 로 산출물을 다시 만듭니다.
7. **확인합니다.** `pnpm harness:sync && pnpm harness:check`.

## 규칙이 전제하는 공용 코드

규칙은 아래 파일이 있다고 보고 쓰였습니다. 없으면 에이전트가 규칙의 이름 그대로 만들게 됩니다.

| 위치 | 내용 | 근거 |
|---|---|---|
| `api/client.ts` | axios 인스턴스, 인증 헤더·401 갱신·`toApiError` 인터셉터, 타임아웃 상수, `isMocked` | 규칙 20·90, `docs/api-guide.md` |
| `api/envelope.ts` | `unwrapEnvelope` (계약에 공통 봉투가 있을 때) | 규칙 90 |
| `lib/money.ts` · `lib/mask.ts` · `lib/date.ts` | `KRW`·`formatKRW`, 마스킹, 서버 시각 파싱 | 규칙 80·90 |
| `lib/contract.ts` | `ContractMismatchError` | 규칙 60, `docs/api-guide.md` |
| `lib/utils.ts` | `cn` | `AGENTS.md` |
| `components/ui/` | RNR 기본 세트(`Text`·`Button`·`Input`·`Card`·`Badge`·`Skeleton`·`Separator`·`Icon`·`Dialog`), `AmountInput`·`AmountText`·`EmptyState`, `ScreenHeader`, `screen.tsx`(`useHeaderlessTop`) | 규칙 40·80, `design/DESIGN.md` 5장 |
| `features/auth/components/PinPad.tsx` | 6자리 PIN 입력 | 규칙 80 |

## 디자인 흐름

```
design.pen (Pencil — 확정 원천: 변수 51개 + 아트보드)
   ├─ sync-pen-tokens.cjs ──▶ design/tokens.json ──sync-tokens.cjs──▶ tailwind.config.js · global.css · lib/theme.ts
   │                                                                         │  규칙 70: 시맨틱 토큰만 사용
   ├─ 구현 전 대조 (Pencil MCP Get · TakeScreenshot, design-map.json 노드 id) ─▶ components/ui(RNR) · features 구현 → tokens:check
   └─ (선택) pnpm figma:build ──▶ Figma   ← 공유·열람용 출력물. 코드는 Figma를 읽지 않는다
```

- 토큰 변경은 Pencil 변수 → `pnpm tokens:sync` 순서만 허용됩니다. `tokens:check` 와 `harness:check` 가 `design.pen` 과 `tokens.json` 의 불일치를 잡습니다.
- Pencil MCP 는 에디터에 `.pen` 파일이 열려 있어야 응답합니다. Figma 는 `scripts/figma/` 가 내보내기만 하는 출력물이며 코드의 근거로 읽지 않습니다.

## 명령

```bash
pnpm tokens:sync      # design.pen 변수 → design/tokens.json → tailwind.config.js, global.css, lib/theme.ts
pnpm tokens:check     # design.pen↔tokens.json 일치 + 산출물 최신 여부 + UI 코드의 토큰 위반 검사
pnpm harness:sync     # .agents → .claude 미러 동기화
pnpm harness:check    # 미러·JSON·skills-lock·Pencil↔토큰·산출물·이미지 참조 무결성 검사
pnpm harness:backup   # 하네스를 저장소 밖(~/harness-backup/<저장소>-<폴더>)으로 복사 — 하네스를 추적하지 않는 프로젝트용
pnpm harness:restore  # 백업에서 되돌리기 (--prev 직전 세대, --dry 변경 확인만)
pnpm figma:build      # (선택) design.pen 화면 + 토큰 → Figma 로컬 플러그인 code.js
```

## 규칙 요약

| 파일 | 적용 경로 | 핵심 |
|---|---|---|
| `00-baseline` | app, components, features, hooks, lib, 설정 | 범위 준수, NativeWind 전용, 서버 데이터는 Query, 코드 품질 4기준 |
| `10-react-state` | app, components, features, hooks | 상태 5분류, Query/Zustand, Hook 선택 |
| `20-api-data` | api, features/**/api, queries, mutations | 5계층 호출, Key 팩토리, AbortSignal |
| `30-typescript-structure` | app, components, features, hooks, lib | strict, 단일 책임, 파일 배치 |
| `40-styling-accessibility` | app, components, features, css | 토큰, 헤더 규칙, Pressable/FlatList, SafeArea, 접근성 |
| `50-error-security` | app, components, features, hooks, lib, env | 오류 UX, 로깅, SecureStore |
| `60-dependencies-tests` | package.json, 설정, 테스트 | pnpm 전용, 사전 승인, 테스트는 `model.ts` 중심 |
| `70-design-tokens` | app, components, features, design, 생성 파일 | 토큰 원천(Pencil)·산출물, RNR 벤더 규약, Pencil 대조 |
| `80-fintech-security` | app, components, features, hooks, lib, api | 금액 정밀도, 중복 실행 방지, PIN/생체, 마스킹, 로깅 |
| `90-backend-contract` | api, queries, mutations, openapi | 계약 원천, DTO↔모델, 봉투·오류 정규화, 헤더, 목 |

## 스킬

| 스킬 | 용도 |
|---|---|
| `pencil-design` | Pencil = 확정 원천. A 화면 드래프트 · B 구현 전 대조 · C 변수 → tokens.json 동기화 |
| `fintech-ui-patterns` | 금액·계좌·거래·이체·PIN·오류 패턴 체크리스트 |

## 자동 검사

- **Claude Code 훅** (`.claude/settings.json` → `scripts/hooks/post-edit-check.sh`): `app/ components/ features/ lib/` 편집 후 토큰 위반 검사(위반 시 Claude 에게 오류 반환), `design/tokens.json` 편집 후 산출물 재생성, `.agents/` 편집 후 `.claude/` 미러 동기화.
- **CI 워크플로 없음**: push 전 검증은 로컬 명령으로 수행합니다.

## 하네스 유지보수

- 규칙은 `.agents/rules/NN-topic.md` 에 `paths` frontmatter 와 함께 쓰고 `pnpm harness:sync` 로 미러를 갱신합니다. `.claude/rules`, `.claude/skills` 는 직접 고치지 않습니다.
- 스킬을 더하면 `skills-lock.json` 에 출처를 적습니다(`harness:check` 가 누락을 잡습니다).
- 프로젝트에서 규칙을 고쳐 쓰다가 다른 프로젝트에도 쓸 만한 개선이 생기면, 프로젝트 고유 값은 `docs/` 로 빼고 규칙만 이 저장소에 되돌립니다.

## 라이선스

MIT (`frontend/LICENSE`).
