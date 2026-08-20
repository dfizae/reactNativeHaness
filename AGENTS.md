# 프로젝트: MyFirstApp (React Native)

## 프로젝트 기본 정보

- Expo 기반 React Native 앱이다. 기술 스택은 Expo SDK 57, React Native 0.86, React 19, TypeScript이다.
- 패키지 매니저는 `npm`만 사용한다. 네이티브 모듈이 포함되거나 Expo SDK 버전에 민감한 패키지는 `npx expo install`로 설치한다.
- 라우팅은 Expo Router(파일 기반), 스타일링은 NativeWind(Tailwind 문법)를 사용한다.
- 서버 상태는 TanStack Query, 전역 클라이언트 상태는 Zustand, HTTP 클라이언트는 axios를 사용한다.
- 위 스택 중 아직 설치되지 않은 항목(TypeScript, Expo Router, NativeWind 포함)은 필요한 시점에 승인을 받아 설치한다.
- 화면(라우트)은 `app/` 디렉토리에 파일 기반으로 만든다. 라우트 파일은 화면 조립과 파라미터 처리만 담당한다.
- 여러 화면에서 재사용하는 컴포넌트는 `components/`, 커스텀 훅은 `hooks/`, 순수 유틸은 `lib/`에 둔다. 한 화면에서만 사용하는 작은 하위 컴포넌트는 해당 화면 파일 가까이에 둔다.
- UI는 React Native 코어 컴포넌트(View, Text, Pressable, FlatList 등)를 우선 사용한다. DOM 기반 웹 라이브러리(shadcn/ui, Radix 등)는 동작하지 않으므로 사용하지 않는다. 공용 UI 컴포넌트가 필요하면 `components/ui/`에 NativeWind 기반으로 직접 작성한다.

## 규칙과 문서 적용

- 세부 규칙은 `.agents/rules/`에 분리되어 있다. 작업 대상 경로에 적용되는 규칙을 먼저 읽고 함께 적용한다.
- `.claude/rules/`는 Claude용 미러이므로 동일한 규칙을 `AGENTS.md`에 다시 나열하지 않는다. `.agents/rules/`를 수정하면 `.claude/rules/`에도 동일하게 반영한다.
- 코드 품질 기준은 `docs/frontend-code-quality.md`와 `docs/frontend_clean_code_guide.md`를 따른다. 두 문서의 예시는 웹(React DOM) 기준이므로 원칙만 React Native에 맞게 적용한다.
- `docs/frontend-spec.md`, `docs/api-guide.md`, `docs/live-session-redesign.md`, `docs/superpowers/`는 이전 웹 프로젝트의 문서이므로 이 프로젝트에 적용하지 않는다.
- `vercel-react-best-practices` 스킬은 리렌더링·훅 관련 규칙만 참고하고 SSR, hydration, 번들 분할 등 웹 전용 규칙은 적용하지 않는다.
- 사용자 요청과 프로젝트 문서가 충돌하면 사용자 요청을 우선한다. 문서끼리 충돌하거나 필수 문서를 읽을 수 없으면 임의로 판단하지 말고 그 사실을 보고한다.
- 기존 디렉토리 구조, 컴포넌트 패턴, 명명 규칙을 먼저 확인하고 명확한 이유 없이 새로운 패턴이나 별도 아키텍처를 도입하지 않는다.

## 작업 범위와 승인

- 명세나 요청에 없는 사용자 기능, 화면, 버튼, 필터, 설정을 임의로 추가하지 않는다.
- 로딩, 빈 상태, 오류, 비활성화, 접근성, 다양한 화면 크기 대응과 요청 중 중복 실행 방지는 기능 완성에 필요한 기본 상태로 간주한다.
- 요청 범위와 관련 없는 리팩터링, 파일 이동, 이름 변경, 포맷 변경을 함께 수행하지 않는다.
- 전체 구현을 요청받으면 섹션 단위로 구현하고 검증하되 중간 승인을 기다리지 않고 요청된 범위까지 완료한다. 사용자가 단계별 검토를 요청한 경우에만 각 단계에서 확인을 기다린다.
- 파일 삭제, 대규모 파일 이동, 공개 API 변경, 설정 파일(`app.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js` 등)의 광범위한 변경 전에는 확인을 요청한다.
- 새로운 패키지 설치, 기존 패키지 제거, 주요 버전 변경, Expo SDK 업그레이드 전에는 확인을 요청한다.

## 디자인 방향

- UI는 블루 계열의 신뢰 톤과 slate 계열의 텍스트·서피스를 유지하고 `tailwind.config.js`의 NativeWind 테마 토큰을 사용한다.
- 색상 토큰을 추가하거나 변경하면 라이트와 다크(`dark:` variant) 양쪽을 함께 정의한다.
- 폰트는 IBM Plex Sans KR을 `expo-font`(`@expo-google-fonts/ibm-plex-sans-kr`)로 로드해 사용한다.
- 제목은 `font-semibold`, 본문은 `font-normal`을 기본으로 하며 크기는 `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` 단계를 우선 사용한다.
- 간격은 4px 그리드, 카드는 `rounded-xl`을 기본으로 한다. 그림자는 iOS와 Android의 렌더링 차이가 크므로 `shadow-sm` 수준까지만 최소한으로 사용한다.
- 그라데이션 남용, 세 가지 이상의 포인트 컬러, 이모지 아이콘을 피하고 아이콘은 `lucide-react-native`를 사용한다.
- 터치 타깃은 최소 44x44pt를 확보한다.
- UI 작업 전 `.agents/skills/frontend-design/SKILL.md`와 `.agents/skills/ui-ux-pro-max/SKILL.md`를 읽고, 웹(HTML/CSS) 전제의 지침은 React Native에 맞게 번안해 적용한다.

## 완료와 보고

- 코드 변경 후 `package.json`에 정의된 관련 검증 명령을 확인해 실행한다. TypeScript와 ESLint 도입 이후의 기본 검증 명령은 `npx tsc --noEmit`과 `npx expo lint`이다.
- 검증 명령이 없거나 실행할 수 없으면 성공했다고 표현하지 않고, 실행하지 못한 항목과 이유를 보고한다.
- 오류를 해결하기 위해 ESLint 규칙, TypeScript 설정, 테스트를 비활성화하거나 완화하지 않는다.
- 테스트 통과를 목적으로 기존 테스트를 삭제하거나 검증 수준을 낮추지 않는다.
- 작업 리포트에는 코드나 실행 결과로 확인한 사실만 작성하고, 확인할 수 없는 수치나 결과는 추정하지 않고 `TBD`로 표시한다.
