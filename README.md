# React Native 에이전트 하네스 — 여기록

여기록(여행 코스 공유 · 발자취 · AR 팁 · AI 여행 기록)의 Expo / React Native 프론트엔드에서 AI 코딩 에이전트가 따르는 규칙 묶음이다. 에이전트는 이 하네스로 다음을 일관되게 따른다.
- 팀 디자인 시스템(Figma)을 옮긴 **Pencil(`design.pen`) 디자인 원천**
- **위치·사진·사용자 콘텐츠 규칙**
- **네이티브 모듈 규칙**
- **백엔드 계약과 MSW 목**

앱 코드는 들어 있지 않다. 규칙·스킬·훅·검사 스크립트·문서만 있다.

전제 스택은 `frontend/AGENTS.md`에 있다: Expo SDK 57 · React Native 0.86 · TypeScript strict · Expo Router · NativeWind v4 · React Native Reusables · TanStack Query · Zustand · axios · MSW · Maestro · pnpm.

> 2026-10-27: KeyFin(이전 핀테크 프로젝트)용 하네스를 여기록용으로 바꿨다.
> - 핀테크 규칙·스킬과 KeyFin 디자인 자산을 제거했다.
> - 디자인 토큰을 Figma `자율 A109` 디자인 시스템 값(Noto Sans KR, 라이트 고정)으로 교체했다.
> - 위치·사진·UGC 규칙(80), 네이티브 모듈 규칙(85), MSW·Maestro를 추가했다.

## 구성

```text
├── CLAUDE.md                     # 저장소 안내 (Claude Code 세션은 frontend/ 에서 시작)
└── frontend/                     # 프로젝트의 프론트 폴더에 그대로 놓이는 단위
    ├── AGENTS.md                 # 에이전트 진입점 — 프로젝트 정보·디렉토리·승인·보고
    ├── CLAUDE.md                 # @AGENTS.md
    ├── .agents/                  # 하네스 정본
    │   ├── rules/                #   00~60 기본, 70 디자인 토큰, 80 위치·사진·UGC, 85 네이티브 모듈, 90 백엔드 계약·MSW
    │   └── skills/               #   pencil-design · yeogirok-ui-patterns
    ├── .claude/                  # Claude Code 미러(rules, skills) + settings.json(권한·훅)
    ├── .maestro/                 # Maestro E2E flow (flows/, subflows/)
    ├── skills-lock.json          # 스킬 출처 기록
    ├── docs/                     # frontend-spec(기능 67개) · api-contract(API 83개) · api-guide · worklog-guide
    ├── scripts/                  # sync-harness · check-harness · harness-backup/restore ·
    │                             # sync-pen-tokens · sync-tokens · check-tokens · hooks/
    ├── design.pen                # Pencil 작업 파일 = 코드 구현의 확정 원천 (문서 변수 49개, 화면 아트보드는 아직 없음)
    ├── design/                   # tokens.json(값) · DESIGN.md(의도·Figma 대응표) · design-map.json(노드 id) · pencil/
    ├── tailwind.config.js        # 생성 파일 (pnpm tokens:sync)
    ├── global.css                # 생성 파일
    ├── lib/theme.ts              # 생성 파일
    └── package.json              # 하네스 명령만 담은 scripts
```

## 프로젝트에 적용하기

1. **스택을 준비한다.** 위 전제 스택으로 Expo 프로젝트를 만들어 프론트 폴더(예: `frontend/`)에 두고, 개발 빌드(`expo-dev-client`)를 설정한다.
2. **하네스를 복사한다.** 이 저장소의 `frontend/` 안에서 아래 항목을 프로젝트의 프론트 폴더로 옮긴다. 루트 `CLAUDE.md`는 저장소 루트에 둔다.
   - `.agents/`, `.claude/`, `.maestro/`
   - `AGENTS.md`, `CLAUDE.md`, `skills-lock.json`
   - `docs/`, `scripts/`, `design/`, `design.pen`
3. **명령을 합친다.** `frontend/package.json`의 `scripts`를 프로젝트 `package.json`에 더한다. 하네스 문서는 아래 명령도 있다고 전제한다.
   - `typecheck`(`tsc --noEmit`)
   - `lint`(`expo lint`)
   - `test`(`jest`)
   - `ui:add`(`pnpm dlx shadcn@latest add --yes`)
4. **`.gitignore`를 합친다.** `WORKLOG.md`(로컬 전용 작업 기록 버퍼)를 무시 목록에 넣는다.
5. **테스트 도구를 들인다.**
   - `pnpm add -D msw @msw/react-native`를 실행하고 `jest.setup`에 MSW를 연결한다(`docs/api-guide.md` §9).
   - Maestro CLI는 각자 설치한다(`.maestro/README.md`).
6. **설정을 맞춘다.**
   - `app.json`에 `userInterfaceStyle: "light"`를 설정한다.
   - `expo-font`로 Noto Sans KR Regular·Medium·Bold를 등록한다.
   - 위치·카메라·사진 권한 문구를 한국어로 쓴다(규칙 85).
7. **토큰 산출물을 확인한다.** `tailwind.config.js`·`global.css`·`lib/theme.ts`는 여기록 값으로 생성되어 있다. 토큰을 바꿨다면 `pnpm tokens:sync`로 다시 만든다.
8. **확인한다.** `pnpm harness:sync && pnpm harness:check`.

## 규칙이 전제하는 공용 코드

규칙은 아래 파일이 있다고 보고 쓰였다. 없으면 에이전트가 규칙에 적힌 이름 그대로 만든다.

| 위치 | 내용 | 근거 |
|---|---|---|
| `api/client.ts` | axios 인스턴스, 인증 헤더·401 갱신·`toApiError` 인터셉터, 타임아웃 상수(조회·변경·업로드) | 규칙 20·90, `docs/api-guide.md` |
| `api/envelope.ts` · `api/errors.ts` | `unwrapEnvelope`(`{ success, data }`), `ApiError`·공통 code C001~C017 처리 | 규칙 90 |
| `api/mocks/` | MSW `handlers/<domain>.ts`·`fixtures/<domain>.ts`·`network.ts`(앱, `@msw/react-native`)·`server.ts`(jest, `msw/node`) | 규칙 60·90 |
| `lib/money.ts` · `lib/mask.ts` · `lib/date.ts` | 경비 표시 `KRW`·`formatKRW`, 카드번호 마스킹, 서버 일시(`2026-07-27 15:30:00+09`) 파싱 | 규칙 80·90 |
| `lib/native/` | 위치·지도·카메라 어댑터(SDK는 여기서만 import) | 규칙 85 |
| `lib/contract.ts` | `ContractMismatchError` | 규칙 60, `docs/api-guide.md` |
| `lib/utils.ts` | `cn` | `AGENTS.md` |
| `components/ui/` | RNR 기본 세트(`Text`·`Button`·`Input`·`Card`·`Badge`·`Skeleton`·`Separator`·`Icon`·`Dialog`), `SearchField`·`FilterChip`·`EmptyState`·`BottomSheet`·`Toast`·`TabBar`·`PermissionGate`, `ScreenHeader`, `screen.tsx`(`useHeaderlessTop`) | 규칙 40·70, `design/DESIGN.md` 5장 |

## 디자인 흐름

```
Figma 자율 A109 › Design 페이지 (팀 디자인 시스템: 변수 66 · 텍스트 스타일 9 · 컴포넌트 4) ─ 값의 출처
Figma 자율 A109 › Wireframe 페이지 (Wxx) ─ 화면 구성·문구·흐름 참고
   │ 에이전트가 읽어 옮긴다 (코드는 Figma를 읽지 않는다)
   ▼
design.pen (Pencil — 확정 원천: 변수 49개 + 아트보드)
   ├─ sync-pen-tokens.cjs ──▶ design/tokens.json ──sync-tokens.cjs──▶ tailwind.config.js · global.css · lib/theme.ts
   │                                                                         │  규칙 70: 시맨틱 토큰만 사용
   └─ 구현 전 대조 (Pencil MCP Get · TakeScreenshot, design-map.json 노드 id) ─▶ components/ui(RNR) · features 구현 → tokens:check
```

- 토큰 변경 순서는 Figma 값 확인 → Pencil 변수 → `pnpm tokens:sync`다. `tokens:check`와 `harness:check`가 `design.pen`과 `tokens.json`의 불일치를 잡는다.
- 이름은 shadcn 규약을 유지하고 값은 Figma에서 가져온다. 대응표는 `design/DESIGN.md` §2에 있다.
- Pencil MCP는 에디터에 `.pen` 파일이 열려 있어야 응답한다.
- Pencil → Figma 내보내기 도구(`scripts/figma/`, `pnpm figma:build`)는 KeyFin 때 만든 것으로, 2026-10-27 제거했다(사용자 결정 — 유지 금지). Figma는 팀이 직접 관리하는 상류 자료이고, 하네스는 Figma에 쓰지 않는다.

## 명령

```bash
pnpm tokens:sync      # design.pen 변수 → design/tokens.json → tailwind.config.js, global.css, lib/theme.ts
pnpm tokens:check     # design.pen↔tokens.json 일치 + 산출물 최신 여부 + UI 코드의 토큰 위반 검사
pnpm harness:sync     # .agents → .claude 미러 동기화
pnpm harness:check    # 미러·JSON·skills-lock·Pencil↔토큰·산출물·규칙 frontmatter·이미지 참조 검사 (통과 시 한 줄, --verbose로 전체)
pnpm harness:backup   # 하네스를 저장소 밖(~/harness-backup/<저장소>-<폴더>)으로 복사
pnpm harness:restore  # 백업에서 되돌리기 (--prev 직전 세대, --dry 변경 확인만)
pnpm e2e              # Maestro E2E (MAESTRO_APP_ID=<번들 id> pnpm e2e)
```

## 규칙 요약

| 파일 | 적용 경로 | 핵심 |
|---|---|---|
| `00-baseline` | app, components, features, hooks, lib, 설정 | 범위 준수, NativeWind 전용, 서버 데이터는 Query, 코드 품질 4기준 |
| `10-react-state` | app, components, features, hooks | 상태 5분류, Query/Zustand, Hook 선택 |
| `20-api-data` | api, features/**/api, queries, mutations | 5계층 호출, Key 팩토리, 지도 영역 조회, 비동기 작업 폴링, 업로드, 버전 충돌 |
| `30-typescript-structure` | app, components, features, hooks, lib | strict, 단일 책임, 파일 배치 |
| `40-styling-accessibility` | app, components, features, css | 토큰, 헤더 규칙, 터치 44·간격 8, SafeArea, 접근성 |
| `50-error-security` | app, components, features, hooks, lib, env | 오류 UX, 로깅, SecureStore |
| `60-dependencies-tests` | package.json, 설정, 테스트, api/mocks, .maestro | pnpm 전용, 사전 승인, 단위·API(MSW)·E2E(Maestro) 3층 테스트 |
| `70-design-tokens` | app, components, features, design, 생성 파일 | Figma → Pencil → 토큰, shadcn 이름 + Figma 값, 라이트 고정, RNR 규약 |
| `80-location-media-ugc` | app, components, features, hooks, lib, api, env | foreground 위치·위치 증거, 공개 범위, EXIF, 영수증 마스킹, UGC, 소셜 로그인 |
| `85-native-modules` | app, components, features, hooks, lib, app.json, eas.json | 개발 빌드, config plugin, 지도·AR 어댑터, AR 세션·폴백, 키 관리, 실기기 검증 |
| `90-backend-contract` | api, queries, mutations, openapi, jest.setup | 계약 원천, DTO↔모델, 봉투·오류 code, 멱등성 키, 커서, MSW |

## 스킬

| 스킬 | 용도 |
|---|---|
| `pencil-design` | Pencil = 확정 원천. A Figma 와이어프레임 참고 드래프트 · B 구현 전 대조 · C Figma 값 → Pencil 변수 → tokens.json 동기화 |
| `yeogirok-ui-patterns` | 탭·권한·작업 진행·코스·여행방·일정·지도·발자취·AR 팁·업로드·기록·공개 패턴 체크리스트 |

## 자동 검사

- **Claude Code 훅** (`.claude/settings.json` → `scripts/hooks/post-edit-check.sh`)
  - `app/ components/ features/ lib/` 편집 후 토큰 위반을 검사한다. 위반이 있으면 Claude에게 오류를 돌려준다.
  - `design/tokens.json` 편집 후 산출물을 다시 만든다.
  - `.agents/` 편집 후 `.claude/` 미러를 동기화한다.
- **`harness:check` 출력**: 통과하면 한 줄만 출력하고, 실패하면 실패한 항목만 출력한다(`--verbose`로 전체 출력).
- **CI 워크플로 없음**: push 전 검증은 로컬 명령으로 한다.

## 하네스 유지보수

- 규칙은 `.agents/rules/NN-topic.md`에 `paths` frontmatter와 함께 쓰고, `pnpm harness:sync`로 미러를 갱신한다. `.claude/rules`, `.claude/skills`는 직접 고치지 않는다.
- 스킬을 더하면 `skills-lock.json`에 출처를 적는다(`harness:check`가 누락을 잡는다).
- 프로젝트 고유 값은 `docs/`에 둔다. 규칙에는 코드에서 다루는 방식만 둔다.

## 라이선스

MIT (`frontend/LICENSE`).
