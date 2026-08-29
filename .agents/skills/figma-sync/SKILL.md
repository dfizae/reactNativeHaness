---
name: figma-sync
description: Figma Variables·컴포넌트를 design/tokens.json, DESIGN.md, figma-map.json으로 동기화하고 tailwind/global.css/lib/theme.ts를 재생성한다. 디자인 토큰 변경, Figma 파일 연결, 화면 구현 전 Figma 대조가 필요할 때 사용한다.
metadata:
  author: project
  version: "1.0.0"
---

# figma-sync

Figma가 디자인의 원천이고, 이 스킬은 그 원천을 코드가 읽을 수 있는 파일로 옮기는 절차다.

## 언제 쓰는가

- 디자이너가 Figma Variables(색·타이포·간격·반경)를 바꿨을 때
- Figma 파일을 처음 연결할 때 (`design/tokens.json`의 `$source.figmaFileKey`가 `TBD`인 상태)
- 새 화면·컴포넌트를 구현하기 전에 `design/figma-map.json`을 갱신할 때
- "Figma대로 만들어줘", "디자인 토큰 동기화해줘" 같은 요청

## 전제

- Figma MCP(`mcp__claude_ai_Figma__*`)가 연결되어 있고 `whoami`가 성공한다.
- 사용자가 Figma 파일 URL을 제공했다. URL이 없으면 진행하지 말고 요청한다.
- 시트 권한이 View면 읽기 도구(`get_*`)만 동작한다. `use_figma`, Code Connect 쓰기는 실패할 수 있으므로 시도 전에 사용자에게 알린다.

## 절차 A — Variables → tokens.json

1. `get_variable_defs`를 Figma 파일(또는 Foundations 페이지 노드)에 호출해 변수 정의를 가져온다.
2. 변수 이름을 `design/tokens.json` 구조로 매핑한다.
   - `color/primitive/blue/800` → `primitive.color.blue.800`
   - `color/semantic/brand/primary` → `semantic.color.brand.primary` (모드별 값은 `{ light, dark }`)
   - `typography/h1/fontSize` 등 → `semantic.typography.h1.{fontSize,lineHeight,fontWeight,letterSpacing}`
   - `spacing/4` → `primitive.space.4`, `radius/lg` → `semantic.radius.lg`
   - 시맨틱 색상 값은 가능하면 프리미티브 참조(`{primitive.color.blue.800}`)로 기록한다. Figma 변수가 alias면 참조로, 직접값이면 hex로.
3. Figma 변수 이름이 위 구조와 다르면 **파일 구조를 바꾸지 말고** 매핑 표를 이 스킬의 `references/variable-mapping.md`(없으면 생성)에 기록한다.
4. `$source.figmaFileKey`, `$source.lastSyncedAt`(ISO-8601, 실행 시각)을 갱신한다.
5. `pnpm tokens:sync` 실행 → `tailwind.config.js`, `global.css`, `lib/theme.ts` 재생성.
6. `pnpm tokens:check`, `pnpm typecheck` 실행. 기존 코드에서 사라진 토큰을 참조하면 실패하므로 목록을 사용자에게 보고하고 승인 후 수정한다.

## 절차 B — DESIGN.md 갱신

1. Foundations 페이지를 `get_screenshot`으로 확인하고 `get_design_context`로 텍스트 스타일·색 사용 의도를 읽는다.
2. `design/DESIGN.md`의 1~4장은 **의도**를 기록하는 곳이다. 값은 tokens.json에 있으므로 값을 복사하지 않고 "어떤 역할에 어떤 토큰을 쓰는지"만 갱신한다.
3. 7장 "동기화 섹션" 표를 갱신한다.

## 절차 C — 컴포넌트·화면 매핑 (figma-map.json)

1. `get_metadata`로 Components/Screens 페이지의 노드 트리를 가져온다.
2. `design/DESIGN.md` 5장 인벤토리의 이름과 일치하는 컴포넌트 노드를 찾아 `figma-map.json`의 `components.<Name>.{nodeId,url}`을 채운다.
3. 화면 프레임 이름을 `screens.<key>`와 대응시킨다. 이름이 다르면 Figma 이름을 우선 반영하되 `route`는 유지한다.
4. `get_code_connect_map`이 동작하면 결과를 `figma-map.json`과 대조해 불일치를 보고한다.

## 절차 D — 화면 구현 전 대조 (매 UI 작업)

1. `figma-map.json`에서 대상 화면/컴포넌트의 `url`을 찾는다.
2. `get_design_context`(구조·스타일)와 `get_screenshot`(시각 확인)을 호출한다. 두 결과가 다르면 스크린샷을 우선한다.
3. 반환된 코드 스니펫은 **참고용**이다. 그대로 붙이지 않고 `70-design-tokens.md` 규칙(시맨틱 토큰, RN 코어 컴포넌트, 접근성)에 맞게 다시 쓴다.
4. Figma 값이 tokens.json에 없는 값을 쓰고 있으면 토큰 추가를 요청 목록에 적고 가장 가까운 기존 토큰으로 구현한다.

## 금지

- `tailwind.config.js`, `global.css`, `lib/theme.ts`를 직접 편집하지 않는다.
- Figma 스니펫의 hex, px, 웹 전용 CSS(`hover:`, `grid`, `position: sticky`)를 그대로 옮기지 않는다.
- 동기화 실패(권한, 레이트 리밋)를 성공으로 보고하지 않는다. `whoami`와 오류 메시지를 함께 보고한다.

## 보고 형식

```
Figma 동기화 보고
- 파일: <url> / 컬렉션: <목록>
- 변경된 토큰: 추가 n, 수정 n, 삭제 n (목록)
- 재생성: tailwind.config.js, global.css, lib/theme.ts
- 검증: tokens:check <결과>, typecheck <결과>
- 후속 필요: <사라진 토큰을 쓰는 파일 등>
```
