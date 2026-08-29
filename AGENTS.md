# 프로젝트: 모바일 핀테크 앱 (React Native + Java 백엔드)

## 프로젝트 기본 정보

- 모바일 핀테크 서비스(계좌 조회, 이체, 결제, 인증)의 React Native 클라이언트다. 백엔드는 Java(Spring) 별도 저장소이며 두 저장소의 계약은 OpenAPI 스펙이다(`.agents/rules/90-backend-contract.md`).
- Expo 기반이다. 기술 스택은 Expo SDK 57, React Native 0.86, React 19, TypeScript(`strict`)이다.
- 패키지 매니저는 `pnpm`만 사용한다. 네이티브 모듈이 포함되거나 Expo SDK 버전에 민감한 패키지는 `pnpm expo install`로 설치한다.
- 라우팅은 Expo Router(파일 기반), 스타일링은 NativeWind(Tailwind 문법)를 사용한다.
- 서버 상태는 TanStack Query, 전역 클라이언트 상태는 Zustand, HTTP 클라이언트는 axios를 사용한다. 보안 저장소는 `expo-secure-store`, 생체인증은 `expo-local-authentication`, 아이콘은 `lucide-react-native`, 폰트는 Pretendard(`expo-font`)를 사용한다.
- 공용 UI는 React Native Reusables(RNR, shadcn 규약, `components/ui/`)를 기반으로 하며 `pnpm ui:add https://reactnativereusables.com/r/nativewind/<name>.json`으로 추가한다. 유틸은 `cn`(`@/lib/utils`), 경로 별칭 `@/`는 프로젝트 루트다.
- 위 스택은 모두 설치되어 있다. ESLint는 `pnpm lint`로 실행하고, 테스트(jest-expo + RNTL)는 아직 도입되지 않았다. 현재 설치 상태는 `package.json`이 기준이다.

## 디렉토리 역할

- `app/` — Expo Router 라우트. 화면 조립, 파라미터 처리, 레이아웃 연결만 담당한다. 라우트가 아닌 파일을 두지 않는다. 인증 여부에 따라 `(auth)`, `(app)` 그룹으로 나눈다.
- `features/<domain>/` — 도메인 단위 코드(`account`, `transfer`, `auth`, `payment` …). 하위에 `api/`(도메인 API 함수·Query/Mutation), `components/`, `model.ts`, `errors.ts`, 필요 시 `store.ts`를 둔다. 도메인에 종속된 훅·유틸은 여기에 둔다.
- `components/ui/` — 도메인과 무관한 공용 UI 컴포넌트. 이름과 variant는 `design/DESIGN.md`의 인벤토리와 Figma 컴포넌트명을 따른다.
- `hooks/`, `lib/` — 도메인 무관 커스텀 훅, 순수 유틸(`money.ts`, `mask.ts`, `date.ts`). `lib/theme.ts`는 생성 파일이다.
- `api/` — `client.ts`(axios 인스턴스·인터셉터), `generated/`(OpenAPI 생성물), `mocks/`.
- `design/` — 디자인 원천. `tokens.json`(값), `DESIGN.md`(의도), `figma-map.json`(화면·컴포넌트 ↔ Figma 노드), `pencil/`(대안 드래프트). Pencil 메인 작업 파일은 루트의 `design.pen`이다.
- `scripts/` — 하네스·토큰 스크립트. `package.json`의 `tokens:*`, `harness:*` 명령이 이를 호출한다.
- UI는 `components/ui/`의 RNR 컴포넌트(`Text`, `Button`, `Input`, `Card`, `Badge`, `Skeleton`, `Separator`, `Icon`, `Dialog`)와 React Native 코어 컴포넌트(View, Pressable, FlatList 등)를 사용한다. 텍스트는 RN `Text` 대신 `@/components/ui/text`의 `Text`를 쓴다. 웹 DOM 기반 라이브러리(shadcn/ui 웹판, Radix 등)는 동작하지 않으므로 사용하지 않는다.

## 규칙과 문서 적용

- 세부 규칙은 `.agents/rules/`에 분리되어 있다. 작업 대상 경로에 적용되는 규칙을 먼저 읽고 함께 적용한다. 번호가 클수록 도메인 특화 규칙이며 충돌 시 큰 번호가 우선한다.
- `.claude/`는 Claude Code용 미러다. `.agents/rules/`, `.agents/skills/`를 수정하면 `pnpm harness:sync`로 미러를 갱신하고 `pnpm harness:check`로 확인한다. `.claude/`를 직접 편집하지 않는다.
- 코드 품질 기준은 `docs/frontend-code-quality.md`와 `docs/frontend_clean_code_guide.md`를 따른다. 두 문서의 예시는 웹(React DOM) 기준이므로 원칙만 React Native에 맞게 적용한다.
- 스킬은 `.agents/skills/`에 있다. 프로젝트 전용 스킬은 `figma-sync`, `pencil-design`, `fintech-ui-patterns`이고, 외부 스킬(`frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`, `design-system`, `brand`)은 웹 전제 지침을 React Native에 맞게 번안해 참고한다. `vercel-react-best-practices`는 리렌더링·훅 규칙만 적용하고 SSR·hydration·번들 분할 규칙은 적용하지 않는다.
- 사용자 요청과 프로젝트 문서가 충돌하면 사용자 요청을 우선한다. 단, `80-fintech-security.md`의 금액·멱등성·민감정보 규칙을 완화하는 요청은 위험을 먼저 알린 뒤 진행한다. 문서끼리 충돌하거나 필수 문서를 읽을 수 없으면 임의로 판단하지 말고 그 사실을 보고한다.
- 기존 디렉토리 구조, 컴포넌트 패턴, 명명 규칙을 먼저 확인하고 명확한 이유 없이 새로운 패턴이나 별도 아키텍처를 도입하지 않는다.

## 디자인 원천 (Figma / Pencil)

- 디자인의 단일 원천은 `design/tokens.json`과 `design/DESIGN.md`다. UI 작업 전 두 파일을 읽는다. 이 문서(AGENTS.md)에는 디자인 값을 적지 않는다.
- `design/tokens.json`은 Figma Variables에서 `figma-sync` 스킬로 동기화한다. 손으로 수정하지 않는다. `tailwind.config.js`, `global.css`, `lib/theme.ts`는 `pnpm tokens:sync`가 생성하므로 직접 편집하지 않는다.
- className에는 시맨틱 토큰만 사용한다(`bg-card`, `text-muted-foreground`, `bg-primary`, `text-destructive`, `text-h1`, `text-amount-lg` …). 프리미티브 팔레트, hex, arbitrary value를 쓰지 않는다. 상세는 `.agents/rules/70-design-tokens.md`.
- 화면·컴포넌트를 구현하기 전에 `design/figma-map.json`에서 Figma 노드를 찾아 대조한다. 없으면 `DESIGN.md` 기준으로 구현하고 보고서에 "Figma 미대조"로 표시한다.
- 디자인 톤과 컴포넌트 스타일은 아직 확정되지 않았다. Pencil 작업 파일은 `design.pen`이며 Figma 플러그인으로 불러온 디자인을 여기서 확정한 뒤 `figma-sync`로 토큰에 반영한다. 새 화면 시안은 `pencil-design` 스킬로 그린다. Pencil은 탐색 도구이고 확정본은 Figma다.
- 계좌·이체·결제·인증 화면은 `fintech-ui-patterns` 스킬의 체크리스트를 따른다. 로딩·빈·오류 상태가 없는 화면은 완성으로 보지 않는다.
- UI 작업 전 `.agents/skills/frontend-design/SKILL.md`를 읽되, 웹(HTML/CSS) 전제의 지침은 React Native에 맞게 번안해 적용한다.

## 작업 범위와 승인

- 명세나 요청에 없는 사용자 기능, 화면, 버튼, 필터, 설정을 임의로 추가하지 않는다.
- 로딩, 빈 상태, 오류, 비활성화, 접근성, 다양한 화면 크기 대응, 요청 중 중복 실행 방지, 민감 정보 마스킹은 기능 완성에 필요한 기본 상태로 간주한다.
- 요청 범위와 관련 없는 리팩터링, 파일 이동, 이름 변경, 포맷 변경을 함께 수행하지 않는다.
- 전체 구현을 요청받으면 섹션 단위로 구현하고 검증하되 중간 승인을 기다리지 않고 요청된 범위까지 완료한다. 사용자가 단계별 검토를 요청한 경우에만 각 단계에서 확인을 기다린다.
- 다음 작업은 시작 전에 확인을 요청한다: 파일 삭제, 대규모 파일 이동, 공개 API 변경, 설정 파일(`app.json`, `babel.config.js`, `metro.config.js`)의 광범위한 변경, `design/tokens.json` 직접 수정, `api/generated/` 재생성 외 수정, 새로운 패키지 설치·제거·주요 버전 변경·Expo SDK 업그레이드.

## 완료와 보고

- 코드 변경 후 `package.json`의 검증 명령을 실행한다: `pnpm typecheck`, `pnpm lint`, `pnpm tokens:check`(UI 변경 시), `pnpm harness:check`(하네스 변경 시), `pnpm test`(테스트 도입 후).
- 검증 명령이 없거나 실행할 수 없으면 성공했다고 표현하지 않고, 실행하지 못한 항목과 이유를 보고한다.
- 오류를 해결하기 위해 ESLint 규칙, TypeScript 설정, 테스트, 토큰 검사를 비활성화하거나 완화하지 않는다.
- 테스트 통과를 목적으로 기존 테스트를 삭제하거나 검증 수준을 낮추지 않는다.
- 작업 리포트에는 코드나 실행 결과로 확인한 사실만 작성하고, 확인할 수 없는 수치나 결과는 추정하지 않고 `TBD`로 표시한다. UI 작업 보고에는 참조한 Figma 노드(또는 "미대조")와 토큰 검사 결과를 포함한다.
- 의미 있는 커밋 직후와 세션 마무리 전에는 `docs/WORKLOG.md` §2 절차로 작업 기록을 갱신하고 Notion 미러에 반영한다(트리거: "WORKLOG 갱신해줘"). 해석은 사용자가 말한 것만 적고 추정은 `[확인]`을 붙인다. `WORKLOG.md`는 로컬 전용 파일로 `.gitignore`에 등록되어 있으며 커밋하지 않는다 — 공유본은 Notion 미러다.
